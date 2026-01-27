'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye, Sparkles, Maximize2 } from 'lucide-react';
import { DIAGRAM_STRUCTURES, DIAGRAM_STYLES, DiagramStructure, DiagramStyle } from '@/lib/diagram-agent';
import { Lightbox } from '@/components/ui/lightbox';

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

interface DiagramGalleryGridProps {
    items: DiagramGalleryItem[];
}

export function DiagramGalleryGrid({ items }: DiagramGalleryGridProps) {
    const [selectedItem, setSelectedItem] = useState<DiagramGalleryItem | null>(null);
    const [viewMode, setViewMode] = useState<'final' | 'wireframe'>('final');
    const [lightboxImage, setLightboxImage] = useState<{ mimeType: string; dataBase64: string } | null>(null);

    // Reset lightbox state when dialog closes
    useEffect(() => {
        if (!selectedItem) {
            setLightboxImage(null);
        }
    }, [selectedItem]);

    const handleDownload = (e: React.MouseEvent, item: DiagramGalleryItem) => {
        e.stopPropagation();
        e.preventDefault();
        const img = viewMode === 'final' && item.finalImage ? item.finalImage : item.wireframeImage;
        if (!img) return;

        const link = document.createElement('a');
        link.href = `data:${img.mimeType};base64,${img.dataBase64}`;
        link.download = `diagram_${item.id}_${viewMode}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        // Cleanup after a short delay
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
    };

    const getStructureLabel = (type: string): string => {
        const structure = DIAGRAM_STRUCTURES[type as DiagramStructure];
        return structure ? `${structure.icon} ${structure.label}` : type;
    };

    const getStyleLabel = (type: string): string => {
        const style = DIAGRAM_STYLES[type as DiagramStyle];
        return style ? style.label : type;
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg">図解がまだありません</p>
                <p className="text-sm mt-2">図解生成モードで作成してみましょう</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                    const displayImage = item.finalImage || item.wireframeImage;

                    return (
                        <Card
                            key={item.id}
                            className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-secondary transition-all"
                            onClick={() => setSelectedItem(item)}
                        >
                            {displayImage && (
                                <div className="aspect-video relative">
                                    <img
                                        src={`data:${displayImage.mimeType};base64,${displayImage.dataBase64}`}
                                        alt={item.title || 'Diagram'}
                                        className="object-cover w-full h-full"
                                        loading="lazy"
                                    />
                                    {item.status === 'wireframe' && (
                                        <Badge className="absolute top-2 right-2 bg-yellow-500">
                                            プレビュー
                                        </Badge>
                                    )}
                                    {item.status === 'completed' && (
                                        <Badge className="absolute top-2 right-2 bg-green-500">
                                            完成
                                        </Badge>
                                    )}
                                </div>
                            )}
                            <CardContent className="p-3">
                                <h3 className="font-semibold truncate">
                                    {item.title || '無題の図解'}
                                </h3>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                        {getStructureLabel(item.structureType)}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {getStyleLabel(item.styleType)}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{selectedItem?.title || '無題の図解'}</DialogTitle>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-4">
                            {/* View Mode Toggle */}
                            {selectedItem.finalImage && selectedItem.wireframeImage && (
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === 'final' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('final')}
                                    >
                                        <Sparkles className="h-4 w-4 mr-1" />
                                        完成版
                                    </Button>
                                    <Button
                                        variant={viewMode === 'wireframe' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('wireframe')}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        プレビュー
                                    </Button>
                                </div>
                            )}

                            {/* Image Display - hover to show expand button */}
                            <div className="border rounded-lg overflow-hidden relative group">
                                {viewMode === 'final' && selectedItem.finalImage ? (
                                    <img
                                        src={`data:${selectedItem.finalImage.mimeType};base64,${selectedItem.finalImage.dataBase64}`}
                                        alt="Final diagram"
                                        className="w-full"
                                    />
                                ) : selectedItem.wireframeImage ? (
                                    <img
                                        src={`data:${selectedItem.wireframeImage.mimeType};base64,${selectedItem.wireframeImage.dataBase64}`}
                                        alt="Wireframe"
                                        className="w-full"
                                    />
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">
                                        画像がありません
                                    </div>
                                )}
                                {/* Fullscreen button overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                                    <Button
                                        size="lg"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white border-white"
                                        onClick={() => {
                                            if (viewMode === 'final' && selectedItem.finalImage) {
                                                setLightboxImage(selectedItem.finalImage);
                                            } else if (selectedItem.wireframeImage) {
                                                setLightboxImage(selectedItem.wireframeImage);
                                            }
                                        }}
                                    >
                                        <Maximize2 className="h-5 w-5 mr-2" />
                                        拡大表示
                                    </Button>
                                </div>
                            </div>

                            {/* Info & Actions */}
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <Badge variant="outline">
                                        {getStructureLabel(selectedItem.structureType)}
                                    </Badge>
                                    <Badge variant="secondary">
                                        {getStyleLabel(selectedItem.styleType)}
                                    </Badge>
                                </div>
                                <Button onClick={(e) => handleDownload(e, selectedItem)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    ダウンロード
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Fullscreen Lightbox */}
            <Lightbox
                image={lightboxImage}
                onClose={() => setLightboxImage(null)}
                title={selectedItem?.title || '図解プレビュー'}
            />
        </>
    );
}
