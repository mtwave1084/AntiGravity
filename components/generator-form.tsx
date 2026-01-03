'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateImage, getGeneratedImages } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload, X, Plus } from 'lucide-react';

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

interface ReferenceImage {
    id: string;
    file: File;
    dataUrl: string;
}

interface GeneratedImage {
    id: string;
    mimeType: string;
    dataBase64: string;
}

export function GeneratorForm({ presets }: GeneratorFormProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
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
    const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]); // Multiple reference images

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
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

    // Compress image to reduce size for upload
    const compressImage = (dataUrl: string, maxSize: number = 1024, quality: number = 0.7): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if larger than maxSize
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Convert to JPEG with compression
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = dataUrl;
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setInputImageFile(file);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result as string);
                setInputImage(compressed);
            };
            reader.readAsDataURL(file);
            // Switch to image-to-image mode
            setTaskType('image-to-image');
        }
    };

    const clearInputImage = () => {
        setInputImage(null);
        setInputImageFile(null);
        if (referenceImages.length === 0) {
            setTaskType('text-to-image');
        }
    };

    const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const compressed = await compressImage(reader.result as string);
                    const newRef: ReferenceImage = {
                        id: 'ref_' + Math.random().toString(36).substr(2, 9),
                        file,
                        dataUrl: compressed,
                    };
                    setReferenceImages(prev => [...prev, newRef]);
                };
                reader.readAsDataURL(file);
            });
            // Enable img2img mode if not already
            if (taskType === 'text-to-image') {
                setTaskType('image-to-image');
            }
        }
        // Clear the input so the same file can be selected again
        e.target.value = '';
    };

    const removeReferenceImage = (id: string) => {
        setReferenceImages(prev => prev.filter(img => img.id !== id));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        setGeneratedImages([]);

        try {
            // Prepare input images if provided
            const inputImagesArray: { mimeType: string; dataBase64: string; role: 'base' | 'reference' }[] = [];

            // Add base image
            if (inputImage && taskType === 'image-to-image') {
                const base64Data = inputImage.split(',')[1];
                const mimeType = inputImage.match(/data:([^;]+);/)?.[1] || 'image/png';
                inputImagesArray.push({
                    mimeType,
                    dataBase64: base64Data,
                    role: 'base' as const,
                });
            }

            // Add reference images
            for (const ref of referenceImages) {
                const base64Data = ref.dataUrl.split(',')[1];
                const mimeType = ref.dataUrl.match(/data:([^;]+);/)?.[1] || 'image/png';
                inputImagesArray.push({
                    mimeType,
                    dataBase64: base64Data,
                    role: 'reference' as const,
                });
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
                inputImages: inputImagesArray.length > 0 ? inputImagesArray : undefined,
            });

            if (result.success && result.imageIds) {
                // Fetch images separately to avoid response size limits
                const images = await getGeneratedImages(result.imageIds);
                setGeneratedImages(images as GeneratedImage[]);
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
                                <Select 
                                    value={outputResolution} 
                                    onValueChange={(val) => {
                                        setOutputResolution(val);
                                        // 2k/4k requires Pro model
                                        if (val === '2k' || val === '4k') {
                                            setProvider('nanobanana-pro');
                                        }
                                    }}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1k">1k</SelectItem>
                                        <SelectItem value="2k">2k (Pro)</SelectItem>
                                        <SelectItem value="4k">4k (Pro)</SelectItem>
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
                            <Label className="text-lg font-semibold text-primary">Base Image (Optional - for img2img)</Label>
                            {!inputImage ? (
                                <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                        <div className="bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                                            <Upload className="h-8 w-8 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Click to upload base image</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <img src={inputImage} alt="Input" className="w-full rounded-2xl shadow-md" />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                                        onClick={clearInputImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Reference Images Section */}
                        <div className="grid gap-2 border-t pt-4">
                            <Label className="text-lg font-semibold text-secondary">Reference Images (Optional)</Label>
                            <p className="text-xs text-muted-foreground mb-2">Add multiple reference images for style or content guidance</p>

                            <div className="grid grid-cols-3 gap-2">
                                {referenceImages.map(ref => (
                                    <div key={ref.id} className="relative group aspect-square">
                                        <img
                                            src={ref.dataUrl}
                                            alt="Reference"
                                            className="w-full h-full object-cover rounded-xl shadow-sm"
                                        />
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                                            onClick={() => removeReferenceImage(ref.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}

                                {/* Add Reference Button */}
                                <div className="aspect-square border-2 border-dashed border-secondary/30 rounded-xl flex items-center justify-center hover:border-secondary hover:bg-secondary/5 transition-all cursor-pointer group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleReferenceImageUpload}
                                        className="hidden"
                                        id="reference-upload"
                                    />
                                    <label htmlFor="reference-upload" className="cursor-pointer flex flex-col items-center gap-1 p-2">
                                        <Plus className="h-6 w-6 text-secondary/50 group-hover:text-secondary transition-colors" />
                                        <span className="text-xs text-muted-foreground group-hover:text-secondary transition-colors">Add</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full text-lg font-bold py-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-95 bg-gradient-to-r from-primary to-orange-400 hover:from-orange-400 hover:to-primary"
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Dreaming...
                                </>
                            ) : (
                                '✨ Generate Magic ✨'
                            )}
                        </Button>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {/* Preview area for generated images */}
                {generatedImages.length > 0 ? (
                    <Card className="border-2 border-primary/20">
                        <CardContent className="p-4">
                            <Label className="text-lg font-semibold text-primary mb-4 block">Generated Images ✨</Label>
                            <p className="text-xs text-muted-foreground mb-3">Click an image to view in gallery</p>
                            <div className="grid grid-cols-2 gap-3">
                                {generatedImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] group"
                                        onClick={() => router.push('/gallery')}
                                    >
                                        <img
                                            src={`data:${img.mimeType};base64,${img.dataBase64}`}
                                            alt="Generated"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                                            <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity">
                                                View in Gallery →
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
                        <div className="text-center p-8">
                            <div className="text-5xl mb-4">🎨</div>
                            {isGenerating ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="text-lg font-medium">Dreaming up your images...</span>
                                </div>
                            ) : (
                                <span className="text-lg">Generated images will appear here</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
