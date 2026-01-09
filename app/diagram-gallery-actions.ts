'use server';

import { auth } from '@/auth';
import db from '@/lib/db';
import { DiagramJob } from '@/lib/diagram-agent';

interface DiagramGalleryItem {
    id: string;
    title: string | null;
    structureType: string;
    styleType: string;
    status: string;
    createdAt: string;
    wireframeImage: { id: string; mimeType: string; dataBase64: string } | null;
    finalImage: { id: string; mimeType: string; dataBase64: string } | null;
}

export async function getDiagramGalleryItems(): Promise<DiagramGalleryItem[]> {
    const session = await auth();
    if (!session?.user?.email) return [];

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(session.user.email) as any;
    if (!user) return [];

    const jobs = db.prepare(`
        SELECT * FROM DiagramJob 
        WHERE userId = ? AND status IN ('wireframe', 'completed')
        ORDER BY createdAt DESC 
        LIMIT 50
    `).all(user.id) as DiagramJob[];

    const items: DiagramGalleryItem[] = [];

    for (const job of jobs) {
        let wireframeImage = null;
        let finalImage = null;

        if (job.wireframeImageId) {
            const img = db.prepare('SELECT id, mimeType, dataBase64 FROM DiagramImage WHERE id = ?')
                .get(job.wireframeImageId) as any;
            if (img) {
                wireframeImage = { id: img.id, mimeType: img.mimeType, dataBase64: img.dataBase64 };
            }
        }

        if (job.finalImageId) {
            const img = db.prepare('SELECT id, mimeType, dataBase64 FROM DiagramImage WHERE id = ?')
                .get(job.finalImageId) as any;
            if (img) {
                finalImage = { id: img.id, mimeType: img.mimeType, dataBase64: img.dataBase64 };
            }
        }

        items.push({
            id: job.id,
            title: job.title || null,
            structureType: job.structureType,
            styleType: job.styleType,
            status: job.status,
            createdAt: job.createdAt,
            wireframeImage,
            finalImage,
        });
    }

    return items;
}
