'use client';

import { useState } from 'react';
import { ImageDetailDialog } from '@/components/image-detail-dialog';
import { toggleFavorite } from '@/app/actions';

interface GalleryGridProps {
    images: any[];
}

export function GalleryGrid({ images }: GalleryGridProps) {
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const handleToggleFavorite = async (imageId: string) => {
        await toggleFavorite(imageId);
        // Update local state
        if (selectedImage && selectedImage.id === imageId) {
            setSelectedImage({ ...selectedImage, favorite: !selectedImage.favorite });
        }
    };

    return (
        <>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {images.map((img) => (
                    <div
                        key={img.id}
                        className="relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => setSelectedImage(img)}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={`data:${img.mimeType};base64,${img.dataBase64}`}
                            alt={img.label || 'Generated Image'}
                            className="object-cover w-full h-full hover:scale-105 transition-transform"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
            <ImageDetailDialog
                image={selectedImage}
                open={!!selectedImage}
                onOpenChange={(open) => !open && setSelectedImage(null)}
                onToggleFavorite={handleToggleFavorite}
            />
        </>
    );
}
