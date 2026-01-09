import { getDiagramGalleryItems } from '@/app/diagram-gallery-actions';
import { DiagramGalleryGrid } from '@/components/diagram-gallery-grid';

export default async function DiagramGalleryPage() {
    const items = await getDiagramGalleryItems();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">図解ギャラリー</h2>
                <p className="text-muted-foreground">生成した図解の一覧です。</p>
            </div>
            <DiagramGalleryGrid items={items} />
        </div>
    );
}
