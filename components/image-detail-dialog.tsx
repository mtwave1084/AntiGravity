'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Heart, Download, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Lightbox } from '@/components/ui/lightbox';

interface ImageDetailDialogProps {
    image: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onToggleFavorite?: (imageId: string) => void;
}

export function ImageDetailDialog({ image, open, onOpenChange, onToggleFavorite }: ImageDetailDialogProps) {
    const [showLightbox, setShowLightbox] = useState(false);

    // Reset lightbox state when dialog closes
    useEffect(() => {
        if (!open) {
            setShowLightbox(false);
        }
    }, [open]);

    if (!image) return null;

    const downloadImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const link = document.createElement('a');
        link.href = `data:${image.mimeType};base64,${image.dataBase64}`;
        link.download = `banana-shaker-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleToggleFavorite = () => {
        onToggleFavorite?.(image.id);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        <div className="flex-1 bg-black/5 flex items-center justify-center p-4 overflow-auto relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`data:${image.mimeType};base64,${image.dataBase64}`}
                                alt={image.label || 'Generated Image'}
                                className="w-full h-full object-contain drop-shadow-lg"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                                <Button
                                    size="lg"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white border-white"
                                    onClick={() => setShowLightbox(true)}
                                >
                                    <Maximize2 className="h-5 w-5 mr-2" />
                                    拡大表示
                                </Button>
                            </div>
                        </div>
                        <div className="w-full md:w-80 border-l bg-background flex flex-col">
                            <DialogHeader className="p-6 border-b bg-sidebar/50">
                                <DialogTitle className="text-xl font-bold text-primary">画像詳細</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-300px)]">
                                <div className="space-y-6">
                                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border/50">
                                        <h4 className="text-sm font-bold mb-2 text-primary flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-primary"></span> プロンプト
                                        </h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{image.prompt}</p>
                                    </div>
                                    {image.negativePrompt && (
                                        <div className="bg-card p-4 rounded-xl shadow-sm border border-border/50">
                                            <h4 className="text-sm font-bold mb-2 text-destructive flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-destructive"></span> ネガティブ
                                            </h4>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{image.negativePrompt}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-secondary/10 p-3 rounded-xl">
                                            <span className="text-xs font-medium text-muted-foreground block mb-1">プロバイダー</span>
                                            <p className="font-semibold text-secondary-foreground">{image.provider}</p>
                                        </div>
                                        <div className="bg-accent/10 p-3 rounded-xl">
                                            <span className="text-xs font-medium text-muted-foreground block mb-1">日付</span>
                                            <p className="font-semibold text-accent-foreground">{new Date(image.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            <div className="p-6 border-t bg-sidebar/30 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant={image.favorite ? "default" : "outline"}
                                        onClick={handleToggleFavorite}
                                        className={`w-full rounded-xl shadow-sm hover:scale-105 transition-transform ${image.favorite ? 'bg-pink-500 hover:bg-pink-600 border-pink-500' : 'hover:text-pink-500 hover:border-pink-500'}`}
                                    >
                                        <Heart className={`mr-2 h-4 w-4 ${image.favorite ? 'fill-current' : ''}`} />
                                        {image.favorite ? 'お気に入り済' : 'お気に入り'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={(e) => downloadImage(e)}
                                        className="w-full rounded-xl shadow-sm hover:scale-105 transition-transform hover:text-primary hover:border-primary"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        保存
                                    </Button>
                                </div>
                                <Link href={`/generate?preset=${image.jobId}&from_history=true`} className="block">
                                    <Button className="w-full rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all bg-gradient-to-r from-primary to-orange-400 font-bold py-6">
                                        <Play className="mr-2 h-5 w-5 fill-current" /> リミックス
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Fullscreen Lightbox */}
            < Lightbox
                image={showLightbox ? { mimeType: image.mimeType, dataBase64: image.dataBase64 } : null
                }
                onClose={() => setShowLightbox(false)}
                title={image.label || '生成画像'}
            />
        </>
    );
}
