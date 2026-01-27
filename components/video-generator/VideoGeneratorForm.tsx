'use client';

import { useState, useRef } from 'react';
import { generateVideo, getGeneratedVideos, confirmVideos } from '@/app/video-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload, X, Plus, Check, Film, Play } from 'lucide-react';

interface ReferenceImage {
    id: string;
    file: File;
    dataUrl: string;
    referenceType: 'asset' | 'style';
}

interface GeneratedVideo {
    id: string;
    mimeType: string;
    dataBase64: string;
    durationSeconds?: number;
}

export function VideoGeneratorForm() {
    // Form state
    const [model, setModel] = useState<string>('veo-3.1-generate-preview');
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('720p');
    const [durationSeconds, setDurationSeconds] = useState<4 | 5 | 6 | 8>(8);

    // Image inputs
    const [startFrame, setStartFrame] = useState<{ dataUrl: string; dataBase64: string; mimeType: string } | null>(null);
    const [endFrame, setEndFrame] = useState<{ dataUrl: string; dataBase64: string; mimeType: string } | null>(null);
    const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const startFrameInputRef = useRef<HTMLInputElement>(null);
    const endFrameInputRef = useRef<HTMLInputElement>(null);
    const referenceInputRef = useRef<HTMLInputElement>(null);

    // Handle image uploads
    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (val: { dataUrl: string; dataBase64: string; mimeType: string } | null) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            setter({
                dataUrl,
                dataBase64: base64,
                mimeType: file.type,
            });
        };
        reader.readAsDataURL(file);
    };

    const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || referenceImages.length >= 3) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            setReferenceImages(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                file,
                dataUrl,
                referenceType: 'asset',
            }]);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const removeReferenceImage = (id: string) => {
        setReferenceImages(prev => prev.filter(img => img.id !== id));
    };

    // Generate video
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('プロンプトを入力してください');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedVideo(null);

        try {
            const result = await generateVideo({
                model: model as any,
                prompt,
                negativePrompt: negativePrompt || undefined,
                aspectRatio,
                resolution,
                durationSeconds,
                startFrame: startFrame ? {
                    mimeType: startFrame.mimeType,
                    dataBase64: startFrame.dataBase64,
                } : undefined,
                endFrame: endFrame ? {
                    mimeType: endFrame.mimeType,
                    dataBase64: endFrame.dataBase64,
                } : undefined,
                referenceImages: referenceImages.length > 0 ? referenceImages.map(img => ({
                    mimeType: img.file.type,
                    dataBase64: img.dataUrl.split(',')[1],
                    referenceType: img.referenceType,
                })) : undefined,
            });

            if (!result.success) {
                throw new Error(result.error || '動画生成に失敗しました');
            }

            // Fetch the generated video
            if (result.videoId) {
                const videos = await getGeneratedVideos([result.videoId]) as GeneratedVideo[];
                if (videos.length > 0) {
                    setGeneratedVideo(videos[0]);
                }
            }
        } catch (err: any) {
            setError(err.message || '動画生成中にエラーが発生しました');
        } finally {
            setIsGenerating(false);
        }
    };

    // Confirm (save to gallery)
    const handleConfirm = async () => {
        if (!generatedVideo) return;

        setIsConfirming(true);
        try {
            await confirmVideos([generatedVideo.id]);
            // Clear after confirmation
            setGeneratedVideo(null);
            setPrompt('');
            setNegativePrompt('');
            setStartFrame(null);
            setEndFrame(null);
            setReferenceImages([]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        {/* Model Selection */}
                        <div className="grid gap-2">
                            <Label>モデル</Label>
                            <Select value={model} onValueChange={setModel}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="veo-3.1-generate-preview">Veo 3.1 (推奨・音声付き)</SelectItem>
                                    <SelectItem value="veo-3.1-fast-generate-preview">Veo 3.1 Fast (高速)</SelectItem>
                                    <SelectItem value="veo-3.0-generate-001">Veo 3.0</SelectItem>
                                    <SelectItem value="veo-3.0-fast-generate-001">Veo 3.0 Fast</SelectItem>
                                    <SelectItem value="veo-2.0-generate-001">Veo 2.0</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Prompt */}
                        <div className="grid gap-2">
                            <Label>プロンプト</Label>
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="生成したい動画の内容を詳しく記述..."
                                rows={4}
                            />
                        </div>

                        {/* Negative Prompt */}
                        <div className="grid gap-2">
                            <Label>ネガティブプロンプト (オプション)</Label>
                            <Textarea
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="除外したい要素..."
                                rows={2}
                            />
                        </div>

                        {/* Settings Row */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>アスペクト比</Label>
                                <Select value={aspectRatio} onValueChange={(v: any) => setAspectRatio(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="16:9">横向き (16:9)</SelectItem>
                                        <SelectItem value="9:16">縦向き (9:16)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>解像度</Label>
                                <Select value={resolution} onValueChange={(v: any) => setResolution(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="720p">720p</SelectItem>
                                        <SelectItem value="1080p">1080p</SelectItem>
                                        <SelectItem value="4k">4K</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>長さ (秒)</Label>
                                <Select value={durationSeconds.toString()} onValueChange={(v) => setDurationSeconds(parseInt(v) as any)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="4">4秒</SelectItem>
                                        <SelectItem value="6">6秒</SelectItem>
                                        <SelectItem value="8">8秒</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Start/End Frames */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>スタートフレーム (オプション)</Label>
                                <input
                                    type="file"
                                    ref={startFrameInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, setStartFrame)}
                                />
                                {startFrame ? (
                                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                        <img
                                            src={startFrame.dataUrl}
                                            alt="Start frame"
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6"
                                            onClick={() => setStartFrame(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="h-20"
                                        onClick={() => startFrameInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        画像を選択
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label>エンドフレーム (オプション)</Label>
                                <input
                                    type="file"
                                    ref={endFrameInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, setEndFrame)}
                                />
                                {endFrame ? (
                                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                        <img
                                            src={endFrame.dataUrl}
                                            alt="End frame"
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6"
                                            onClick={() => setEndFrame(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="h-20"
                                        onClick={() => endFrameInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        画像を選択
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Reference Images */}
                        <div className="grid gap-2">
                            <Label>参照画像 (最大3枚)</Label>
                            <input
                                type="file"
                                ref={referenceInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleReferenceImageUpload}
                            />
                            <div className="flex flex-wrap gap-2">
                                {referenceImages.map((img) => (
                                    <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden">
                                        <img
                                            src={img.dataUrl}
                                            alt="Reference"
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-0.5 right-0.5 h-5 w-5"
                                            onClick={() => removeReferenceImage(img.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                {referenceImages.length < 3 && (
                                    <Button
                                        variant="outline"
                                        className="w-20 h-20"
                                        onClick={() => referenceInputRef.current?.click()}
                                    >
                                        <Plus className="h-6 w-6" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                キャラクター、商品、スタイルなどの参照画像を追加して動画内容をガイド
                            </p>
                        </div>

                        {/* Generate Button */}
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    生成中... (数分かかる場合があります)
                                </>
                            ) : (
                                <>
                                    <Film className="mr-2 h-5 w-5" />
                                    動画を生成
                                </>
                            )}
                        </Button>

                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column - Preview */}
                <Card>
                    <CardContent className="pt-6">
                        <Label className="mb-4 block">プレビュー</Label>

                        {generatedVideo ? (
                            <div className="space-y-4">
                                <div className={`bg-muted rounded-lg overflow-hidden ${aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[300px] mx-auto' : 'aspect-video'}`}>
                                    <video
                                        src={`data:${generatedVideo.mimeType};base64,${generatedVideo.dataBase64}`}
                                        controls
                                        autoPlay
                                        loop
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        onClick={handleConfirm}
                                        disabled={isConfirming}
                                    >
                                        {isConfirming ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="mr-2 h-4 w-4" />
                                        )}
                                        確定してギャラリーに保存
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                    >
                                        再生成
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className={`bg-muted rounded-lg flex items-center justify-center ${aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[300px] mx-auto' : 'aspect-video'}`}>
                                <div className="text-center text-muted-foreground">
                                    <Play className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                    <p>生成された動画がここに表示されます</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
