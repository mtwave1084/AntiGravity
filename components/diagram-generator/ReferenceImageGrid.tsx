'use client';

import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface ReferenceImage {
    id: string;
    mimeType: string;
    dataBase64: string;
}

interface ReferenceImageGridProps {
    images: ReferenceImage[];
    onChange: (images: ReferenceImage[]) => void;
    maxImages?: number;
}

export function ReferenceImageGrid({
    images,
    onChange,
    maxImages = 4
}: ReferenceImageGridProps) {

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const remainingSlots = maxImages - images.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        // Process all files and collect results before updating state
        const processFile = (file: File): Promise<ReferenceImage> => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const dataUrl = reader.result as string;
                    const base64Data = dataUrl.split(',')[1];
                    const mimeType = dataUrl.match(/data:([^;]+);/)?.[1] || 'image/png';

                    resolve({
                        id: 'ref_' + Math.random().toString(36).substr(2, 9),
                        mimeType,
                        dataBase64: base64Data,
                    });
                };
                reader.readAsDataURL(file);
            });
        };

        // Wait for all files to be processed, then update state once
        const newImages = await Promise.all(filesToProcess.map(processFile));
        onChange([...images, ...newImages]);

        // Clear input for re-upload
        e.target.value = '';
    };

    const removeImage = (id: string) => {
        onChange(images.filter(img => img.id !== id));
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
                参照画像（任意）
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                    最大{maxImages}枚
                </span>
            </label>

            <div className="grid grid-cols-4 gap-2">
                {images.map((img) => (
                    <div key={img.id} className="relative aspect-square group">
                        <img
                            src={`data:${img.mimeType};base64,${img.dataBase64}`}
                            alt="Reference"
                            className="w-full h-full object-cover rounded-lg border-2 border-border"
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(img.id)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <div className="aspect-square border-2 border-dashed border-secondary/30 rounded-lg flex items-center justify-center hover:border-secondary hover:bg-secondary/5 transition-all cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            id="diagram-ref-upload"
                        />
                        <label
                            htmlFor="diagram-ref-upload"
                            className="cursor-pointer flex flex-col items-center gap-1 p-2"
                        >
                            <Plus className="h-6 w-6 text-secondary/50" />
                            <span className="text-xs text-muted-foreground">追加</span>
                        </label>
                    </div>
                )}
            </div>

            {images.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    参照画像はスタイルやレイアウトのガイダンスに使用されます
                </p>
            )}
        </div>
    );
}
