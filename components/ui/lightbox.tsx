'use client';

import { useEffect, useCallback } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LightboxProps {
    image: {
        mimeType: string;
        dataBase64: string;
    } | null;
    onClose: () => void;
    title?: string;
}

export function Lightbox({ image, onClose, title }: LightboxProps) {
    // ESCキーで閉じる
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (image) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [image, handleKeyDown]);

    if (!image) return null;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Create and trigger download
        const link = document.createElement('a');
        link.href = `data:${image.mimeType};base64,${image.dataBase64}`;
        link.download = `image-${Date.now()}.${image.mimeType.split('/')[1] || 'png'}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        // Cleanup after a short delay
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            onClick={handleClose}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <span className="text-sm opacity-70">{title || 'プレビュー'}</span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4 mr-1" />
                        ダウンロード
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={handleClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Image container - fills remaining space */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                <img
                    src={`data:${image.mimeType};base64,${image.dataBase64}`}
                    alt="Full size preview"
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Footer hint */}
            <div className="p-4 text-center">
                <p className="text-white/50 text-xs">
                    ESCキーまたは背景クリックで閉じる
                </p>
            </div>
        </div>
    );
}
