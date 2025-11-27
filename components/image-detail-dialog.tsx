'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Heart, Download, Maximize2, Minimize2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ImageDetailDialogProps {
    image: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onToggleFavorite?: (imageId: string) => void;
}

export function ImageDetailDialog({ image, open, onOpenChange, onToggleFavorite }: ImageDetailDialogProps) {
    const [isFullSize, setIsFullSize] = useState(false);

    if (!image) return null;

    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = `data:${image.mimeType};base64,${image.dataBase64}`;
        link.download = `banana-shaker-${image.id}.png`;
        link.click();
    };

    const handleToggleFavorite = () => {
        onToggleFavorite?.(image.id);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={isFullSize ? "max-w-[98vw] max-h-[98vh] flex flex-col p-0 overflow-hidden" : "max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden"}>
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    <div className="flex-1 bg-black/5 flex items-center justify-center p-4 overflow-auto relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={`data:${image.mimeType};base64,${image.dataBase64}`}
                            alt={image.label || 'Generated Image'}
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg p-1">
                            <Button
                                size="icon"
                                variant="secondary"
                                onClick={() => setIsFullSize(!isFullSize)}
                                title={isFullSize ? "Exit fullsize" : "View fullsize"}
                            >
                                {isFullSize ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    {!isFullSize && (
                        <div className="w-full md:w-80 border-l bg-background flex flex-col">
                            <DialogHeader className="p-4 border-b">
                                <DialogTitle>Image Details</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Prompt</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{image.prompt}</p>
                                    </div>
                                    {image.negativePrompt && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Negative Prompt</h4>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{image.negativePrompt}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Provider</span>
                                            <p>{image.provider}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Date</span>
                                            <p>{new Date(image.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={image.favorite ? "default" : "outline"}
                                        onClick={handleToggleFavorite}
                                        className="w-full"
                                    >
                                        <Heart className={`mr-2 h-4 w-4 ${image.favorite ? 'fill-current' : ''}`} />
                                        {image.favorite ? 'Liked' : 'Like'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={downloadImage}
                                        className="w-full"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                                <Link href={`/generate?preset=${image.jobId}&from_history=true`}>
                                    <Button className="w-full">
                                        <Play className="mr-2 h-4 w-4" /> Remix
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
