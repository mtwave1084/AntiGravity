'use server';

import { auth } from '@/auth';
import db from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';
import {
    DiagramConfig,
    DiagramStructure,
    DiagramStyle,
    DiagramBlock,
    DiagramJob,
} from '@/lib/diagram-agent';
import { generateWireframe } from '@/lib/diagram-agent/wireframe-generator';
import { generateFinalRender } from '@/lib/diagram-agent/final-renderer';

// ============================================
// 図解ジョブ作成
// ============================================
export async function createDiagramJob(data: {
    structureType: DiagramStructure;
    styleType: DiagramStyle;
    title?: string;
    blocks: DiagramBlock[];
}): Promise<{ success: boolean; jobId?: string; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' };
    }

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    if (!user) {
        return { success: false, error: 'User not found' };
    }

    const jobId = 'djob_' + Math.random().toString(36).substr(2, 9);

    try {
        const stmt = db.prepare(`
            INSERT INTO DiagramJob (id, userId, structureType, styleType, title, blocks, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `);

        stmt.run(
            jobId,
            user.id,
            data.structureType,
            data.styleType,
            data.title || null,
            JSON.stringify(data.blocks)
        );

        return { success: true, jobId };
    } catch (error: any) {
        console.error('[DiagramActions] Create job error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// ワイヤーフレーム生成
// ============================================
export async function generateDiagramWireframe(
    jobId: string,
    config: DiagramConfig
): Promise<{ success: boolean; imageId?: string; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' };
    }

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    if (!user) {
        return { success: false, error: 'User not found' };
    }

    // Verify job ownership
    const job = db.prepare('SELECT id, userId FROM DiagramJob WHERE id = ?').get(jobId) as any;
    if (!job || job.userId !== user.id) {
        return { success: false, error: 'Diagram job not found or access denied' };
    }

    // Get API key (use nanobanana-pro for diagram generation)
    const keyRecord = db.prepare(
        'SELECT encryptedKey FROM ApiKey WHERE userId = ? AND provider = ?'
    ).get(user.id, 'nanobanana-pro') as any;

    if (!keyRecord) {
        return { success: false, error: 'Nanobanana Pro API key not found. Please add it in Settings.' };
    }

    const apiKey = decrypt(keyRecord.encryptedKey);

    try {
        // Generate wireframe
        const result = await generateWireframe(apiKey, config);

        if (!result.success || !result.dataBase64) {
            db.prepare('UPDATE DiagramJob SET status = ?, errorMessage = ? WHERE id = ?')
                .run('error', result.error || 'Wireframe generation failed', jobId);
            return { success: false, error: result.error };
        }

        // Save wireframe image to DiagramImage table (diagram-specific, no FK conflict)
        const imageId = 'dimg_' + Math.random().toString(36).substr(2, 9);

        db.prepare(`
            INSERT INTO DiagramImage (id, diagramJobId, imageType, mimeType, dataBase64)
            VALUES (?, ?, 'wireframe', ?, ?)
        `).run(imageId, jobId, result.mimeType, result.dataBase64);

        // Update job status
        db.prepare('UPDATE DiagramJob SET status = ?, wireframeImageId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
            .run('wireframe', imageId, jobId);

        revalidatePath('/generate');
        return { success: true, imageId };

    } catch (error: any) {
        console.error('[DiagramActions] Wireframe generation error:', error);
        db.prepare('UPDATE DiagramJob SET status = ?, errorMessage = ? WHERE id = ?')
            .run('error', error.message, jobId);
        return { success: false, error: error.message };
    }
}

// ============================================
// 最終描画生成
// ============================================
export async function generateDiagramFinal(
    jobId: string,
    config: DiagramConfig
): Promise<{ success: boolean; imageId?: string; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' };
    }

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    if (!user) {
        return { success: false, error: 'User not found' };
    }

    // Verify job ownership
    const job = db.prepare('SELECT id, userId FROM DiagramJob WHERE id = ?').get(jobId) as any;
    if (!job || job.userId !== user.id) {
        return { success: false, error: 'Diagram job not found or access denied' };
    }

    // Get API key
    const keyRecord = db.prepare(
        'SELECT encryptedKey FROM ApiKey WHERE userId = ? AND provider = ?'
    ).get(user.id, 'nanobanana-pro') as any;

    if (!keyRecord) {
        return { success: false, error: 'Nanobanana Pro API key not found' };
    }

    const apiKey = decrypt(keyRecord.encryptedKey);

    try {
        // Generate final render
        const result = await generateFinalRender(apiKey, config);

        if (!result.success || !result.dataBase64) {
            db.prepare('UPDATE DiagramJob SET status = ?, errorMessage = ? WHERE id = ?')
                .run('error', result.error || 'Final render failed', jobId);
            return { success: false, error: result.error };
        }

        // Save final image to DiagramImage table
        const imageId = 'dimg_' + Math.random().toString(36).substr(2, 9);

        db.prepare(`
            INSERT INTO DiagramImage (id, diagramJobId, imageType, mimeType, dataBase64)
            VALUES (?, ?, 'final', ?, ?)
        `).run(imageId, jobId, result.mimeType, result.dataBase64);

        // Update job status
        db.prepare('UPDATE DiagramJob SET status = ?, finalImageId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
            .run('completed', imageId, jobId);

        revalidatePath('/generate');
        revalidatePath('/gallery');
        return { success: true, imageId };

    } catch (error: any) {
        console.error('[DiagramActions] Final render error:', error);
        db.prepare('UPDATE DiagramJob SET status = ?, errorMessage = ? WHERE id = ?')
            .run('error', error.message, jobId);
        return { success: false, error: error.message };
    }
}

// ============================================
// 図解画像取得
// ============================================
export async function getDiagramImage(imageId: string): Promise<{
    success: boolean;
    image?: { id: string; mimeType: string; dataBase64: string };
    error?: string;
}> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' };
    }

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    if (!user) {
        return { success: false, error: 'User not found' };
    }

    try {
        // Query DiagramImage and verify ownership via DiagramJob
        const image = db.prepare(`
            SELECT di.id, di.mimeType, di.dataBase64 
            FROM DiagramImage di
            JOIN DiagramJob dj ON di.diagramJobId = dj.id
            WHERE di.id = ? AND dj.userId = ?
        `).get(imageId, user.id) as any;

        if (!image) {
            return { success: false, error: 'Image not found or access denied' };
        }

        return {
            success: true,
            image: {
                id: image.id,
                mimeType: image.mimeType,
                dataBase64: image.dataBase64,
            },
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================================
// 図解履歴取得
// ============================================
export async function getDiagramHistory(): Promise<DiagramJob[]> {
    const session = await auth();
    if (!session?.user?.email) return [];

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    if (!user) return [];

    const jobs = db.prepare(`
        SELECT * FROM DiagramJob 
        WHERE userId = ? 
        ORDER BY createdAt DESC 
        LIMIT 20
    `).all(user.id) as DiagramJob[];

    return jobs;
}
