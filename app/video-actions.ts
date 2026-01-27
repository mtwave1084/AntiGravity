'use server';

import { auth } from '@/auth';
import db from '@/lib/db';
import { runVeoJob, VeoJobRequest, VeoModel } from '@/lib/veo';
import { decrypt } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';

// --- Video Generation ---

export async function generateVideo(data: {
    model: VeoModel;
    prompt: string;
    negativePrompt?: string;
    aspectRatio?: '16:9' | '9:16';
    resolution?: '720p' | '1080p' | '4k';
    durationSeconds?: 4 | 5 | 6 | 8;
    startFrame?: {
        mimeType: string;
        dataBase64: string;
    };
    endFrame?: {
        mimeType: string;
        dataBase64: string;
    };
    referenceImages?: Array<{
        mimeType: string;
        dataBase64: string;
        referenceType?: 'asset' | 'style';
    }>;
}) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    if (!user) throw new Error('User not found');

    // Get Veo API Key
    const keyRecord = db.prepare('SELECT encryptedKey FROM ApiKey WHERE userId = ? AND provider = ?').get(user.id, 'veo') as any;
    if (!keyRecord) throw new Error('Veo API Key not found. Please set it in Settings.');

    const apiKey = decrypt(keyRecord.encryptedKey);

    // Create Job
    const jobId = 'vjob_' + Math.random().toString(36).substr(2, 9);
    const jobStmt = db.prepare(`
        INSERT INTO VideoJob (
            id, userId, model, prompt, negativePrompt, 
            aspectRatio, resolution, durationSeconds,
            startFrameData, endFrameData, referenceImagesData,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    jobStmt.run(
        jobId,
        user.id,
        data.model || 'veo-3.1-generate-preview',
        data.prompt,
        data.negativePrompt || null,
        data.aspectRatio || '16:9',
        data.resolution || '720p',
        data.durationSeconds || 8,
        data.startFrame ? JSON.stringify(data.startFrame) : null,
        data.endFrame ? JSON.stringify(data.endFrame) : null,
        data.referenceImages ? JSON.stringify(data.referenceImages) : null
    );

    try {
        // Run Veo Generation
        const request: VeoJobRequest = {
            apiKey,
            model: data.model || 'veo-3.1-generate-preview',
            prompt: data.prompt,
            negativePrompt: data.negativePrompt,
            aspectRatio: data.aspectRatio || '16:9',
            resolution: data.resolution || '720p',
            durationSeconds: data.durationSeconds || 8,
            startFrame: data.startFrame,
            endFrame: data.endFrame,
            referenceImages: data.referenceImages,
        };

        const result = await runVeoJob(request);

        if (!result.success || !result.video) {
            throw new Error(result.error || 'Video generation failed');
        }

        // Save Video (unconfirmed)
        const videoId = 'vid_' + Math.random().toString(36).substr(2, 9);
        const insertVideo = db.prepare(`
            INSERT INTO Video (id, jobId, mimeType, dataBase64, durationSeconds, confirmed)
            VALUES (?, ?, ?, ?, ?, 0)
        `);

        insertVideo.run(
            videoId,
            jobId,
            result.video.mimeType,
            result.video.dataBase64,
            result.video.durationSeconds || 8
        );

        // Update Job Status
        db.prepare('UPDATE VideoJob SET status = ?, operationName = ? WHERE id = ?')
            .run('success', result.operationName, jobId);

        revalidatePath('/');
        return { success: true, jobId, videoId };

    } catch (error: any) {
        console.error('Video generation failed:', error);
        db.prepare('UPDATE VideoJob SET status = ?, errorMessage = ? WHERE id = ?')
            .run('error', error.message, jobId);
        return { success: false, error: error.message };
    }
}

// --- Confirm Videos (save to gallery) ---

export async function confirmVideos(videoIds: string[]) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    if (!videoIds || videoIds.length === 0) {
        return { success: false, error: 'No videos to confirm' };
    }

    try {
        const placeholders = videoIds.map(() => '?').join(',');
        db.prepare(`UPDATE Video SET confirmed = 1 WHERE id IN (${placeholders})`).run(...videoIds);

        revalidatePath('/gallery');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Confirm failed:', error);
        return { success: false, error: error.message };
    }
}

// --- Get Generated Videos ---

export async function getGeneratedVideos(videoIds: string[]) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    if (!videoIds || videoIds.length === 0) return [];

    const placeholders = videoIds.map(() => '?').join(',');
    const videos = db.prepare(`
        SELECT id, mimeType, dataBase64, durationSeconds FROM Video WHERE id IN (${placeholders})
    `).all(...videoIds);

    return videos;
}

// --- Get Video History ---

export async function getVideoHistory() {
    const session = await auth();
    if (!session?.user?.email) return [];

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    if (!user) return [];

    // Get recent confirmed videos with job info
    const videos = db.prepare(`
        SELECT v.*, j.prompt, j.model, j.createdAt as jobCreatedAt 
        FROM Video v
        JOIN VideoJob j ON v.jobId = j.id
        WHERE j.userId = ? AND COALESCE(v.confirmed, 1) = 1
        ORDER BY v.createdAt DESC
        LIMIT 50
    `).all(user.id);

    return videos;
}

// --- Toggle Favorite ---

export async function toggleVideoFavorite(videoId: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    const video = db.prepare('SELECT * FROM Video WHERE id = ?').get(videoId) as any;
    if (!video) throw new Error('Video not found');

    const newFavorite = video.favorite ? 0 : 1;
    db.prepare('UPDATE Video SET favorite = ? WHERE id = ?').run(newFavorite, videoId);

    revalidatePath('/gallery');
    revalidatePath('/');
    return newFavorite === 1;
}

// --- Delete Unconfirmed Videos ---

export async function deleteUnconfirmedVideos(videoIds: string[]) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    if (!videoIds || videoIds.length === 0) return { success: true };

    try {
        const placeholders = videoIds.map(() => '?').join(',');
        db.prepare(`DELETE FROM Video WHERE id IN (${placeholders}) AND confirmed = 0`).run(...videoIds);
        return { success: true };
    } catch (error: any) {
        console.error('Delete failed:', error);
        return { success: false, error: error.message };
    }
}
