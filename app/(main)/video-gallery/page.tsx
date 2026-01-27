import { getVideoHistory } from '@/app/video-actions';
import { VideoGalleryGrid } from '@/components/video-gallery-grid';

export default async function VideoGalleryPage() {
    const videos = await getVideoHistory() as any[];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">動画ギャラリー</h2>
                <p className="text-muted-foreground">生成した動画の履歴</p>
            </div>
            <VideoGalleryGrid videos={videos} />
        </div>
    );
}
