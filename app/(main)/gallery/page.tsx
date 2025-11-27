import { getHistory } from '@/app/actions';
import { GalleryGrid } from '@/components/gallery-grid';

export default async function GalleryPage() {
    const images = await getHistory();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Gallery</h2>
                <p className="text-muted-foreground">Your generated images history.</p>
            </div>
            <GalleryGrid images={images} />
        </div>
    );
}
