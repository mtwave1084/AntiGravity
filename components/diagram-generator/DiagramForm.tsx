'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Eye } from 'lucide-react';

import { DiagramStructure, DiagramStyle, DiagramBlock, DiagramConfig } from '@/lib/diagram-agent';
import { StructureSelector } from './StructureSelector';
import { StyleSelector } from './StyleSelector';
import { BlockEditor } from './BlockEditor';
import { ReferenceImageGrid } from './ReferenceImageGrid';
import {
    createDiagramJob,
    generateDiagramWireframe,
    generateDiagramFinal,
    getDiagramImage,
} from '@/app/diagram-actions';

interface ReferenceImage {
    id: string;
    mimeType: string;
    dataBase64: string;
}

export function DiagramForm() {
    const router = useRouter();

    // Form state
    const [title, setTitle] = useState('');
    const [structure, setStructure] = useState<DiagramStructure>('guide_chart');
    const [style, setStyle] = useState<DiagramStyle>('playful');
    const [blocks, setBlocks] = useState<DiagramBlock[]>([
        {
            id: 'block_1',
            type: 'header',
            heading: '',
            content: '',
            visualHint: '',
        },
    ]);
    const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [outputResolution, setOutputResolution] = useState('4k');

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState<'idle' | 'wireframe' | 'final'>('idle');
    const [wireframeImage, setWireframeImage] = useState<{ mimeType: string; dataBase64: string } | null>(null);
    const [finalImage, setFinalImage] = useState<{ mimeType: string; dataBase64: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);

    const buildConfig = (): DiagramConfig => ({
        title,
        structure,
        style,
        blocks,
        aspectRatio,
        outputResolution,
        referenceImages: referenceImages.map(img => ({
            mimeType: img.mimeType,
            dataBase64: img.dataBase64,
        })),
    });

    const handleGenerateWireframe = async () => {
        setIsGenerating(true);
        setError(null);
        setGenerationStep('wireframe');
        setWireframeImage(null);
        setFinalImage(null);

        try {
            // Create job first
            const jobResult = await createDiagramJob({
                structureType: structure,
                styleType: style,
                title,
                blocks,
            });

            if (!jobResult.success || !jobResult.jobId) {
                throw new Error(jobResult.error || 'Failed to create job');
            }

            setCurrentJobId(jobResult.jobId);

            // Generate wireframe
            const config = buildConfig();
            const wireframeResult = await generateDiagramWireframe(jobResult.jobId, config);

            if (!wireframeResult.success || !wireframeResult.imageId) {
                throw new Error(wireframeResult.error || 'Wireframe generation failed');
            }

            // Fetch the generated image
            const imageResult = await getDiagramImage(wireframeResult.imageId);
            if (imageResult.success && imageResult.image) {
                setWireframeImage({
                    mimeType: imageResult.image.mimeType,
                    dataBase64: imageResult.image.dataBase64,
                });
            }

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateFinal = async () => {
        if (!currentJobId) {
            setError('No wireframe job found. Please generate wireframe first.');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGenerationStep('final');

        try {
            const config = buildConfig();
            const finalResult = await generateDiagramFinal(currentJobId, config);

            if (!finalResult.success || !finalResult.imageId) {
                throw new Error(finalResult.error || 'Final render failed');
            }

            // Fetch the generated image
            const imageResult = await getDiagramImage(finalResult.imageId);
            if (imageResult.success && imageResult.image) {
                setFinalImage({
                    mimeType: imageResult.image.mimeType,
                    dataBase64: imageResult.image.dataBase64,
                });
            }

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const hasContent = blocks.some(b => b.content.trim() !== '');

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column - Form */}
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6 space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label>図解タイトル</Label>
                            <Input
                                placeholder="例: Suno AI 魔法のタグ術"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Structure Selection */}
                        <StructureSelector
                            value={structure}
                            onChange={setStructure}
                        />

                        {/* Style Selection */}
                        <StyleSelector
                            value={style}
                            onChange={setStyle}
                        />

                        {/* Content Blocks */}
                        <BlockEditor
                            blocks={blocks}
                            onChange={setBlocks}
                            structure={structure}
                        />

                        {/* Reference Images */}
                        <ReferenceImageGrid
                            images={referenceImages}
                            onChange={setReferenceImages}
                        />

                        {/* Output Settings */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>アスペクト比</Label>
                                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="16:9">16:9 (横長)</SelectItem>
                                        <SelectItem value="1:1">1:1 (正方形)</SelectItem>
                                        <SelectItem value="9:16">9:16 (縦長)</SelectItem>
                                        <SelectItem value="4:3">4:3</SelectItem>
                                        <SelectItem value="3:4">3:4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>解像度</Label>
                                <Select value={outputResolution} onValueChange={setOutputResolution}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1k">1K</SelectItem>
                                        <SelectItem value="2k">2K</SelectItem>
                                        <SelectItem value="4k">4K（推奨）</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Generate Buttons */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 gap-2"
                                onClick={handleGenerateWireframe}
                                disabled={isGenerating || !hasContent}
                            >
                                {isGenerating && generationStep === 'wireframe' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        生成中...
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4" />
                                        プレビュー生成
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 gap-2 bg-gradient-to-r from-secondary to-green-400 hover:from-green-400 hover:to-secondary"
                                onClick={handleGenerateFinal}
                                disabled={isGenerating || !wireframeImage}
                            >
                                {isGenerating && generationStep === 'final' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        高精細生成中...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        最終生成
                                    </>
                                )}
                            </Button>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right column - Preview */}
            <div className="space-y-4">
                {/* Wireframe Preview */}
                {wireframeImage && (
                    <Card className="border-2 border-secondary/30">
                        <CardContent className="p-4">
                            <Label className="text-sm font-semibold text-secondary mb-3 block">
                                ワイヤーフレーム（プレビュー）
                            </Label>
                            <img
                                src={`data:${wireframeImage.mimeType};base64,${wireframeImage.dataBase64}`}
                                alt="Wireframe preview"
                                className="w-full rounded-lg border"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Final Image */}
                {finalImage && (
                    <Card className="border-2 border-primary/30">
                        <CardContent className="p-4">
                            <Label className="text-sm font-semibold text-primary mb-3 block">
                                完成画像 ✨
                            </Label>
                            <img
                                src={`data:${finalImage.mimeType};base64,${finalImage.dataBase64}`}
                                alt="Final diagram"
                                className="w-full rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => router.push('/gallery')}
                            />
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                クリックでギャラリーへ移動
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Empty state */}
                {!wireframeImage && !finalImage && !isGenerating && (
                    <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
                        <div className="text-center p-8">
                            <div className="text-5xl mb-4">📊</div>
                            <span className="text-lg">図解のプレビューがここに表示されます</span>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {isGenerating && (
                    <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
                        <div className="text-center p-8">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-secondary" />
                            <span className="text-lg">
                                {generationStep === 'wireframe' ? 'プレビューを生成中...' : '高精細画像を生成中...'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
