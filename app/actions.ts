'use server';

import { auth } from '@/auth';
import db from '@/lib/db';
import { runNanoImageJob, NanoImageJobRequest } from '@/lib/nanobanana';
import { encrypt, decrypt } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- API Keys ---

export async function saveApiKey(provider: string, key: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    if (!user) throw new Error('User not found');

    const encryptedKey = encrypt(key);
    const id = 'key_' + Math.random().toString(36).substr(2, 9);

    const stmt = db.prepare(`
    INSERT INTO ApiKey (id, userId, provider, encryptedKey, updatedAt)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(userId, provider) DO UPDATE SET
    encryptedKey = excluded.encryptedKey,
    updatedAt = CURRENT_TIMESTAMP
  `);

    stmt.run(id, user.id, provider, encryptedKey);
    revalidatePath('/settings');
}

export async function getApiKeys() {
    const session = await auth();
    if (!session?.user?.email) return {};

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    if (!user) return {};

    const keys = db.prepare('SELECT provider, encryptedKey FROM ApiKey WHERE userId = ?').all(user.id) as any[];

    const result: Record<string, string> = {};
    keys.forEach(k => {
        try {
            result[k.provider] = decrypt(k.encryptedKey); // Return decrypted for display (masked in UI)
        } catch (e) {
            console.error('Failed to decrypt key', e);
        }
    });
    return result;
}

// --- Presets ---

export async function createPreset(data: any) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    const id = 'preset_' + Math.random().toString(36).substr(2, 9);

    const stmt = db.prepare(`
    INSERT INTO Preset (
      id, userId, title, tags, provider, taskType, 
      aspectRatio, outputResolution, numOutputs, seed, 
      prompt, negativePrompt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    stmt.run(
        id, user.id, data.title, data.tags, data.provider, data.taskType,
        data.aspectRatio, data.outputResolution, data.numOutputs || 1, data.seed,
        data.prompt, data.negativePrompt
    );

    revalidatePath('/presets');
    return id;
}

export async function updatePreset(id: string, data: any) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    const stmt = db.prepare(`
    UPDATE Preset SET 
      title = ?, tags = ?, provider = ?, taskType = ?,
      aspectRatio = ?, outputResolution = ?, numOutputs = ?, seed = ?,
      prompt = ?, negativePrompt = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

    stmt.run(
        data.title, data.tags, data.provider, data.taskType,
        data.aspectRatio, data.outputResolution, data.numOutputs, data.seed,
        data.prompt, data.negativePrompt, id
    );

    revalidatePath('/presets');
}

export async function deletePreset(id: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    db.prepare('DELETE FROM Preset WHERE id = ?').run(id);
    revalidatePath('/presets');
}

export async function getPresets() {
    const session = await auth();
    if (!session?.user?.email) return [];

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    return db.prepare('SELECT * FROM Preset WHERE userId = ? ORDER BY updatedAt DESC').all(user.id);
}

export async function getPreset(id: string) {
    const session = await auth();
    if (!session?.user?.email) return null;

    return db.prepare('SELECT * FROM Preset WHERE id = ?').get(id);
}

// --- Generation ---

export async function generateImage(data: any) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;

    // Get API Key
    const keyRecord = db.prepare('SELECT encryptedKey FROM ApiKey WHERE userId = ? AND provider = ?').get(user.id, data.provider) as any;
    if (!keyRecord) throw new Error(`API Key for ${data.provider} not found`);

    const apiKey = decrypt(keyRecord.encryptedKey);

    // Create Job
    const jobId = 'job_' + Math.random().toString(36).substr(2, 9);
    const jobStmt = db.prepare(`
    INSERT INTO GenerationJob (
      id, userId, presetId, provider, taskType,
      prompt, negativePrompt, aspectRatio, outputResolution,
      numOutputs, seed, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `);

    jobStmt.run(
        jobId, user.id, data.presetId || null, data.provider, data.taskType,
        data.prompt, data.negativePrompt, data.aspectRatio, data.outputResolution,
        data.numOutputs, data.seed
    );

    try {
        // Run Generation
        const request: NanoImageJobRequest = {
            apiKey,
            model: data.provider,
            taskType: data.taskType,
            prompt: data.prompt,
            negativePrompt: data.negativePrompt,
            aspectRatio: data.aspectRatio,
            outputResolution: data.outputResolution,
            numOutputs: data.numOutputs,
            seed: data.seed,
            inputImages: data.inputImages, // Assuming passed as base64 objects if any
        };

        const result = await runNanoImageJob(request);

        // Save Images with confirmed = false (pending confirmation)
        const insertImage = db.prepare(`
      INSERT INTO Image (id, jobId, "index", mimeType, dataBase64, confirmed)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

        const imageIds: string[] = [];
        for (const img of result.images) {
            const imgId = 'img_' + Math.random().toString(36).substr(2, 9);
            insertImage.run(imgId, jobId, img.index, img.mimeType, img.dataBase64);
            imageIds.push(imgId);
        }

        // Update Job Status
        db.prepare('UPDATE GenerationJob SET status = ? WHERE id = ?').run('success', jobId);

        // Don't revalidate gallery yet - images are not confirmed
        revalidatePath('/');
        // Return only IDs to avoid response size limits - images will be fetched separately
        return { success: true, jobId, imageIds };

    } catch (error: any) {
        console.error('Generation failed:', error);
        db.prepare('UPDATE GenerationJob SET status = ?, errorMessage = ? WHERE id = ?').run('error', error.message, jobId);
        return { success: false, error: error.message };
    }
}

// --- Confirm Images (save to gallery) ---

export async function confirmImages(imageIds: string[]) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    if (!imageIds || imageIds.length === 0) {
        return { success: false, error: 'No images to confirm' };
    }

    try {
        const placeholders = imageIds.map(() => '?').join(',');
        db.prepare(`UPDATE Image SET confirmed = 1 WHERE id IN (${placeholders})`).run(...imageIds);

        revalidatePath('/gallery');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Confirm failed:', error);
        return { success: false, error: error.message };
    }
}

// --- Revise Image (regenerate with modification prompt) ---

export async function reviseImage(data: {
    originalImageIds: string[];
    revisionPrompt: string;
    provider: string;
    aspectRatio: string;
    outputResolution: string;
    numOutputs: number;
    originalPrompt: string;
    inputImages?: Array<{
        mimeType: string;
        dataBase64: string;
        role?: 'base' | 'style' | 'reference' | 'mask';
    }>;
    generatedImage?: {
        mimeType: string;
        dataBase64: string;
    };
}) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;

    // Get API Key
    const keyRecord = db.prepare('SELECT encryptedKey FROM ApiKey WHERE userId = ? AND provider = ?').get(user.id, data.provider) as any;
    if (!keyRecord) throw new Error(`API Key for ${data.provider} not found`);

    const apiKey = decrypt(keyRecord.encryptedKey);

    // Build combined prompt with revision
    const combinedPrompt = `${data.originalPrompt}\n\n[修正指示]: ${data.revisionPrompt}`;

    // Prepare input images array for revision
    // Include: generated image to modify, base image (if any), reference images (if any)
    const allInputImages: Array<{
        mimeType: string;
        dataBase64: string;
        role?: 'base' | 'style' | 'reference' | 'mask';
    }> = [];

    // Add generated image as the base for modification
    if (data.generatedImage) {
        allInputImages.push({
            ...data.generatedImage,
            role: 'base' as const
        });
    }

    // Add original input images (base image and reference images)
    if (data.inputImages) {
        allInputImages.push(...data.inputImages);
    }

    // Determine task type based on whether we have images
    const taskType = allInputImages.length > 0 ? 'image-to-image' : 'text-to-image';

    // Create new job
    const jobId = 'job_' + Math.random().toString(36).substr(2, 9);
    const jobStmt = db.prepare(`
    INSERT INTO GenerationJob (
      id, userId, presetId, provider, taskType,
      prompt, negativePrompt, aspectRatio, outputResolution,
      numOutputs, seed, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `);

    jobStmt.run(
        jobId, user.id, null, data.provider, taskType,
        combinedPrompt, null, data.aspectRatio, data.outputResolution,
        data.numOutputs, null
    );

    try {
        // Run Generation with revision prompt and all images
        const request: NanoImageJobRequest = {
            apiKey,
            model: data.provider as 'nanobanana' | 'nanobanana-pro',
            taskType: taskType as 'text-to-image' | 'image-to-image',
            prompt: combinedPrompt,
            aspectRatio: data.aspectRatio,
            outputResolution: data.outputResolution,
            numOutputs: data.numOutputs,
            inputImages: allInputImages.length > 0 ? allInputImages : undefined,
        };

        const result = await runNanoImageJob(request);

        // Delete old unconfirmed images
        const placeholders = data.originalImageIds.map(() => '?').join(',');
        db.prepare(`DELETE FROM Image WHERE id IN (${placeholders}) AND confirmed = 0`).run(...data.originalImageIds);

        // Save new images (unconfirmed)
        const insertImage = db.prepare(`
      INSERT INTO Image (id, jobId, "index", mimeType, dataBase64, confirmed)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

        const imageIds: string[] = [];
        for (const img of result.images) {
            const imgId = 'img_' + Math.random().toString(36).substr(2, 9);
            insertImage.run(imgId, jobId, img.index, img.mimeType, img.dataBase64);
            imageIds.push(imgId);
        }

        db.prepare('UPDATE GenerationJob SET status = ? WHERE id = ?').run('success', jobId);

        revalidatePath('/');
        return { success: true, jobId, imageIds };

    } catch (error: any) {
        console.error('Revision failed:', error);
        db.prepare('UPDATE GenerationJob SET status = ?, errorMessage = ? WHERE id = ?').run('error', error.message, jobId);
        return { success: false, error: error.message };
    }
}

export async function getGeneratedImages(imageIds: string[]) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    if (!imageIds || imageIds.length === 0) return [];

    const placeholders = imageIds.map(() => '?').join(',');
    const images = db.prepare(`
        SELECT id, mimeType, dataBase64 FROM Image WHERE id IN (${placeholders})
    `).all(...imageIds);

    return images;
}

export async function getHistory() {
    const session = await auth();
    if (!session?.user?.email) return [];

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;

    // Get recent images with job info (only confirmed images, treat NULL as confirmed for backwards compatibility)
    const images = db.prepare(`
    SELECT i.*, j.prompt, j.provider, j.createdAt as jobCreatedAt 
    FROM Image i
    JOIN GenerationJob j ON i.jobId = j.id
    WHERE j.userId = ? AND COALESCE(i.confirmed, 1) = 1
    ORDER BY i.createdAt DESC
    LIMIT 50
  `).all(user.id);

    return images;
}

export async function toggleFavorite(imageId: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    const image = db.prepare('SELECT * FROM Image WHERE id = ?').get(imageId) as any;
    if (!image) throw new Error('Image not found');

    const newFavorite = image.favorite ? 0 : 1;
    db.prepare('UPDATE Image SET favorite = ? WHERE id = ?').run(newFavorite, imageId);

    revalidatePath('/gallery');
    revalidatePath('/');
    return newFavorite === 1;
}
