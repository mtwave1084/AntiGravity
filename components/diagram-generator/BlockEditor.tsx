'use client';

import { DiagramBlock, BlockType, DIAGRAM_STRUCTURES, DiagramStructure } from '@/lib/diagram-agent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface BlockEditorProps {
    blocks: DiagramBlock[];
    onChange: (blocks: DiagramBlock[]) => void;
    structure: DiagramStructure;
}

export function BlockEditor({ blocks, onChange, structure }: BlockEditorProps) {
    const structureInfo = DIAGRAM_STRUCTURES[structure];

    const addBlock = () => {
        const newBlock: DiagramBlock = {
            id: 'block_' + Math.random().toString(36).substr(2, 9),
            type: 'content',
            heading: '',
            content: '',
            visualHint: '',
        };
        onChange([...blocks, newBlock]);
    };

    const updateBlock = (id: string, updates: Partial<DiagramBlock>) => {
        onChange(blocks.map(block =>
            block.id === id ? { ...block, ...updates } : block
        ));
    };

    const removeBlock = (id: string) => {
        onChange(blocks.filter(block => block.id !== id));
    };

    const getBlockTypeLabel = (type: BlockType, index: number, total: number): string => {
        if (type === 'header' || index === 0) return 'ヘッダー';
        if (type === 'footer' || index === total - 1) return 'フッター';
        return `セクション ${index}`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                    コンテンツブロック
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                        (推奨: {structureInfo.recommendedBlocks}ブロック)
                    </span>
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBlock}
                    className="gap-1"
                >
                    <Plus className="h-4 w-4" />
                    追加
                </Button>
            </div>

            <div className="space-y-3">
                {blocks.map((block, index) => (
                    <Card key={block.id} className="border-2 border-border/50 hover:border-secondary/50 transition-colors">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                    <span className="text-sm font-medium text-secondary">
                                        {getBlockTypeLabel(block.type, index, blocks.length)}
                                    </span>
                                </div>
                                {blocks.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeBlock(block.id)}
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">見出し</Label>
                                    <Input
                                        placeholder="ブロックの見出し"
                                        value={block.heading || ''}
                                        onChange={(e) => updateBlock(block.id, { heading: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">内容</Label>
                                    <Textarea
                                        placeholder="このブロックに表示するテキスト内容"
                                        value={block.content}
                                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                        className="mt-1 min-h-[80px]"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">視覚イメージ（任意）</Label>
                                    <Input
                                        placeholder="アイコンや図のヒント（例: 電球アイコン、グラフ）"
                                        value={block.visualHint || ''}
                                        onChange={(e) => updateBlock(block.id, { visualHint: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {blocks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                        <p>ブロックがありません</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addBlock}
                            className="mt-2"
                        >
                            最初のブロックを追加
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
