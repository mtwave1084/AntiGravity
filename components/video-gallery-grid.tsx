'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, Download, Film } from 'lucide-react';
import { toggleVideoFavorite } from '@/app/video-actions';

interface Video {
    id: string;
    mimeType: string;
    dataBase64: string;
    durationSeconds?: number;
    favorite?: boolean;
    prompt?: string;
    model?: string;
    jobCreatedAt?: string;
}

interface VideoGalleryGridProps {
    videos: Video[];
}

export function VideoGalleryGrid({ videos }: VideoGalleryGridProps) {
    const [playingId, setPlayingId] = useState<string | null>(null);

    const handleToggleFavorite = async (videoId: string) => {
        await toggleVideoFavorite(videoId);
    };

    const handleDownload = (video: Video) => {
        const link = document.createElement('a');
        link.href = `data:${video.mimeType};base64,${video.dataBase64}`;
        link.download = `video_${video.id}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Film className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg">まだ動画がありません</p>
                <p className="text-sm">動画を生成して確定すると、ここに表示されます</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden group">
                    <div className="relative aspect-video bg-muted">
                        <video
                            src={`data:${video.mimeType};base64,${video.dataBase64}`}
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                            onPlay={() => setPlayingId(video.id)}
                            onPause={() => setPlayingId(null)}
                        />
                        {/* Overlay controls */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleToggleFavorite(video.id)}
                            >
                                <Heart
                                    className={`h-4 w-4 ${video.favorite ? 'fill-red-500 text-red-500' : ''}`}
                                />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDownload(video)}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="p-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {video.prompt || 'No prompt'}
                        </p>
                        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                            <span>{video.model || 'Veo'}</span>
                            {video.jobCreatedAt && (
                                <span>{new Date(video.jobCreatedAt).toLocaleDateString('ja-JP')}</span>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
