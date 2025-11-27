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

        // Save Images
        const insertImage = db.prepare(`
      INSERT INTO Image (id, jobId, "index", mimeType, dataBase64)
      VALUES (?, ?, ?, ?, ?)
    `);

        for (const img of result.images) {
            const imgId = 'img_' + Math.random().toString(36).substr(2, 9);
            insertImage.run(imgId, jobId, img.index, img.mimeType, img.dataBase64);
        }

        // Update Job Status
        db.prepare('UPDATE GenerationJob SET status = ? WHERE id = ?').run('success', jobId);

        revalidatePath('/');
        revalidatePath('/gallery');
        return { success: true, jobId };

    } catch (error: any) {
        console.error('Generation failed:', error);
        db.prepare('UPDATE GenerationJob SET status = ?, errorMessage = ? WHERE id = ?').run('error', error.message, jobId);
        return { success: false, error: error.message };
    }
}

export async function getHistory() {
    const session = await auth();
    if (!session?.user?.email) return [];

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;

    // Get recent images with job info
    const images = db.prepare(`
    SELECT i.*, j.prompt, j.provider, j.createdAt as jobCreatedAt 
    FROM Image i
    JOIN GenerationJob j ON i.jobId = j.id
    WHERE j.userId = ?
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
