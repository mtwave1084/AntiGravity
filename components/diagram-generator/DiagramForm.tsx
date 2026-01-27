'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Eye, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Lightbox } from '@/components/ui/lightbox';

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
    reviseWireframe,
    reviseFinal,
    finalizeWireframe,
    completeDiagram,
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
    const [previewImage, setPreviewImage] = useState<{ mimeType: string; dataBase64: string } | null>(null);

    // Revision state
    const [wireframeRevisionText, setWireframeRevisionText] = useState('');
    const [finalRevisionText, setFinalRevisionText] = useState('');
    const [isWireframeFinalized, setIsWireframeFinalized] = useState(false);
    const [isFinalCompleted, setIsFinalCompleted] = useState(false);

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

    // ワイヤーフレーム修正ハンドラー
    const handleReviseWireframe = async () => {
        if (!currentJobId || !wireframeRevisionText.trim()) return;

        setIsGenerating(true);
        setError(null);
        setGenerationStep('wireframe');

        try {
            const config = buildConfig();
            const result = await reviseWireframe(currentJobId, config, wireframeRevisionText);

            if (!result.success || !result.imageId) {
                throw new Error(result.error || 'Revision failed');
            }

            const imageResult = await getDiagramImage(result.imageId);
            if (imageResult.success && imageResult.image) {
                setWireframeImage({
                    mimeType: imageResult.image.mimeType,
                    dataBase64: imageResult.image.dataBase64,
                });
                setWireframeRevisionText('');
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // ワイヤーフレーム確定ハンドラー
    const handleFinalizeWireframe = async () => {
        if (!currentJobId) return;

        try {
            const result = await finalizeWireframe(currentJobId);
            if (!result.success) {
                throw new Error(result.error || 'Finalize failed');
            }
            setIsWireframeFinalized(true);
        } catch (e: any) {
            setError(e.message);
        }
    };

    // 最終画像修正ハンドラー
    const handleReviseFinal = async () => {
        if (!currentJobId || !finalRevisionText.trim()) return;

        setIsGenerating(true);
        setError(null);
        setGenerationStep('final');

        try {
            const config = buildConfig();
            const result = await reviseFinal(currentJobId, config, finalRevisionText);

            if (!result.success || !result.imageId) {
                throw new Error(result.error || 'Revision failed');
            }

            const imageResult = await getDiagramImage(result.imageId);
            if (imageResult.success && imageResult.image) {
                setFinalImage({
                    mimeType: imageResult.image.mimeType,
                    dataBase64: imageResult.image.dataBase64,
                });
                setFinalRevisionText('');
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // 図解完了ハンドラー
    const handleCompleteDiagram = async () => {
        if (!currentJobId) return;

        try {
            const result = await completeDiagram(currentJobId);
            if (!result.success) {
                throw new Error(result.error || 'Complete failed');
            }
            setIsFinalCompleted(true);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const hasContent = blocks.some(b => b.content.trim() !== '');

    return (
        <>
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
                        <Card className={`border-2 ${isWireframeFinalized ? 'border-green-500/50' : 'border-secondary/30'}`}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold text-secondary">
                                        ワイヤーフレーム
                                    </Label>
                                    {isWireframeFinalized && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Check className="h-3 w-3" /> 確定済み
                                        </span>
                                    )}
                                </div>
                                <img
                                    src={`data:${wireframeImage.mimeType};base64,${wireframeImage.dataBase64}`}
                                    alt="Wireframe preview"
                                    className="w-full rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setPreviewImage(wireframeImage)}
                                />

                                {/* Revision controls - only show if not finalized */}
                                {!isWireframeFinalized && (
                                    <div className="space-y-2 pt-2 border-t">
                                        <Textarea
                                            placeholder="修正指示を入力（例：タイトルをもっと大きく、キャラをもっと目立たせて）"
                                            value={wireframeRevisionText}
                                            onChange={(e) => setWireframeRevisionText(e.target.value)}
                                            className="text-sm"
                                            rows={2}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 gap-1"
                                                onClick={handleReviseWireframe}
                                                disabled={isGenerating || !wireframeRevisionText.trim()}
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                                修正
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="flex-1 gap-1 bg-green-600 hover:bg-green-700"
                                                onClick={handleFinalizeWireframe}
                                                disabled={isGenerating}
                                            >
                                                <Check className="h-3 w-3" />
                                                確定
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground text-center">
                                    {isWireframeFinalized ? 'ギャラリーに保存されました' : 'クリックで拡大表示'}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Final Image */}
                    {finalImage && (
                        <Card className={`border-2 ${isFinalCompleted ? 'border-green-500/50' : 'border-primary/30'}`}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold text-primary">
                                        完成画像 ✨
                                    </Label>
                                    {isFinalCompleted && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Check className="h-3 w-3" /> 完了
                                        </span>
                                    )}
                                </div>
                                <img
                                    src={`data:${finalImage.mimeType};base64,${finalImage.dataBase64}`}
                                    alt="Final diagram"
                                    className="w-full rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setPreviewImage(finalImage)}
                                />

                                {/* Revision controls - only show if not completed */}
                                {!isFinalCompleted && (
                                    <div className="space-y-2 pt-2 border-t">
                                        <Textarea
                                            placeholder="修正指示を入力（例：色をもっと鮮やかに、テキストを読みやすく）"
                                            value={finalRevisionText}
                                            onChange={(e) => setFinalRevisionText(e.target.value)}
                                            className="text-sm"
                                            rows={2}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 gap-1"
                                                onClick={handleReviseFinal}
                                                disabled={isGenerating || !finalRevisionText.trim()}
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                                修正
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="flex-1 gap-1 bg-green-600 hover:bg-green-700"
                                                onClick={handleCompleteDiagram}
                                                disabled={isGenerating}
                                            >
                                                <Check className="h-3 w-3" />
                                                完了
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Gallery button - only show when completed */}
                                {isFinalCompleted && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2"
                                        onClick={() => router.push('/diagram-gallery')}
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        図解ギャラリーを見る
                                    </Button>
                                )}

                                <p className="text-xs text-muted-foreground text-center">
                                    {isFinalCompleted ? 'ギャラリーに保存済み' : 'クリックで拡大表示'}
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

            {/* Fullscreen Lightbox */}
            <Lightbox
                image={previewImage}
                onClose={() => setPreviewImage(null)}
                title="図解プレビュー"
            />
        </>
    );
}
