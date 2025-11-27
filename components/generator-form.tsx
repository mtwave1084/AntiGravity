'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateImage } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload, X } from 'lucide-react';

interface Preset {
    id: string;
    title: string;
    provider: string;
    taskType: string;
    prompt: string;
    negativePrompt?: string;
    aspectRatio?: string;
    outputResolution?: string;
    numOutputs: number;
    seed?: number;
}

interface GeneratorFormProps {
    presets: Preset[];
}

export function GeneratorForm({ presets }: GeneratorFormProps) {
    const searchParams = useSearchParams();
    const presetId = searchParams.get('preset');

    const [provider, setProvider] = useState('nanobanana');
    const [taskType, setTaskType] = useState('text-to-image');
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [outputResolution, setOutputResolution] = useState('1k');
    const [numOutputs, setNumOutputs] = useState(1);
    const [seed, setSeed] = useState<number | undefined>(undefined);
    const [inputImage, setInputImage] = useState<string | null>(null); // Base64 image
    const [inputImageFile, setInputImageFile] = useState<File | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (presetId) {
            const preset = presets.find(p => p.id === presetId);
            if (preset) {
                setProvider(preset.provider);
                setTaskType(preset.taskType);
                setPrompt(preset.prompt);
                setNegativePrompt(preset.negativePrompt || '');
                setAspectRatio(preset.aspectRatio || '1:1');
                setOutputResolution(preset.outputResolution || '1k');
                setNumOutputs(preset.numOutputs || 1);
                setSeed(preset.seed);
            }
        }
    }, [presetId, presets]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setInputImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setInputImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            // Switch to image-to-image mode
            setTaskType('image-to-image');
        }
    };

    const clearInputImage = () => {
        setInputImage(null);
        setInputImageFile(null);
        setTaskType('text-to-image');
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        setGeneratedImages([]);

        try {
            // Prepare input images if provided
            let inputImages = undefined;
            if (inputImage && taskType === 'image-to-image') {
                const base64Data = inputImage.split(',')[1]; // Remove data:image/...;base64, prefix
                const mimeType = inputImage.match(/data:([^;]+);/)?.[1] || 'image/png';
                inputImages = [{
                    mimeType,
                    dataBase64: base64Data,
                    role: 'base' as const,
                }];
            }

            const result = await generateImage({
                provider,
                taskType,
                prompt,
                negativePrompt,
                aspectRatio,
                outputResolution,
                numOutputs,
                seed,
                inputImages,
            });

            if (result.success) {
                // In a real app, we might want to fetch the images or just reload the page/gallery.
                // For now, let's just show a success message or redirect to gallery?
                // Or better, fetch the job result. But generateImage returns success/jobId.
                // We can't easily get the images back immediately without another fetch if we want to show them here.
                // I'll update generateImage to return images if possible, or fetch them here.
                // For simplicity, I'll redirect to gallery or just show a "Success" message.
                // Actually, users want to see the image immediately.
                // I'll assume generateImage revalidates paths, so maybe I can just fetch the latest job's images?
                // Or I can update generateImage to return the images data.
                // Let's assume for now I'll just show a link to gallery.
                window.location.href = '/gallery';
            } else {
                setError(result.error || 'Generation failed');
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid gap-2">
                            <Label>Preset</Label>
                            <Select
                                value={presetId || ''}
                                onValueChange={(val) => {
                                    const params = new URLSearchParams(searchParams);
                                    if (val) params.set('preset', val);
                                    else params.delete('preset');
                                    window.history.replaceState(null, '', `?${params.toString()}`);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Load a preset..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {presets.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Provider</Label>
                                <Select value={provider} onValueChange={setProvider}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nanobanana">Nanobanana</SelectItem>
                                        <SelectItem value="nanobanana-pro">Nanobanana Pro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Task Type</Label>
                                <Select value={taskType} onValueChange={setTaskType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text-to-image">Text to Image</SelectItem>
                                        <SelectItem value="image-to-image">Image to Image</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Prompt</Label>
                            <Textarea
                                placeholder="Describe your image..."
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                className="h-32"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Negative Prompt</Label>
                            <Input
                                placeholder="Low quality, bad anatomy..."
                                value={negativePrompt}
                                onChange={e => setNegativePrompt(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Aspect Ratio</Label>
                                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                        <SelectItem value="2:3">2:3 (Portrait)</SelectItem>
                                        <SelectItem value="3:2">3:2 (Landscape)</SelectItem>
                                        <SelectItem value="3:4">3:4</SelectItem>
                                        <SelectItem value="4:3">4:3</SelectItem>
                                        <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                                        <SelectItem value="16:9">16:9</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Resolution</Label>
                                <Select value={outputResolution} onValueChange={setOutputResolution}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1k">1k</SelectItem>
                                        <SelectItem value="2k">2k</SelectItem>
                                        <SelectItem value="4k">4k</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Count</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={4}
                                    value={numOutputs}
                                    onChange={e => setNumOutputs(parseInt(e.target.value))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Seed (Optional)</Label>
                                <Input
                                    type="number"
                                    placeholder="Random"
                                    value={seed || ''}
                                    onChange={e => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="grid gap-2 border-t pt-4">
                            <Label>Input Image (Optional - for img2img)</Label>
                            {!inputImage ? (
                                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img src={inputImage} alt="Input" className="w-full rounded-lg" />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2"
                                        onClick={clearInputImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || !prompt}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate'
                            )}
                        </Button>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {/* Placeholder for results or preview */}
                <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                    {isGenerating ? 'Dreaming...' : 'Generated images will appear here (Redirecting to gallery for now)'}
                </div>
            </div>
        </div>
    );
}
