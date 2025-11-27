'use client';

import { useState } from 'react';
import { createPreset, updatePreset } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PresetDialogProps {
    preset?: any;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function PresetDialog({ preset, trigger, open, onOpenChange }: PresetDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const showOpen = open !== undefined ? open : isOpen;
    const setShowOpen = onOpenChange || setIsOpen;

    const [title, setTitle] = useState(preset?.title || '');
    const [tags, setTags] = useState(preset?.tags || '');
    const [provider, setProvider] = useState(preset?.provider || 'nanobanana');
    const [taskType, setTaskType] = useState(preset?.taskType || 'text-to-image');
    const [prompt, setPrompt] = useState(preset?.prompt || '');
    const [negativePrompt, setNegativePrompt] = useState(preset?.negativePrompt || '');
    const [aspectRatio, setAspectRatio] = useState(preset?.aspectRatio || '1:1');
    const [outputResolution, setOutputResolution] = useState(preset?.outputResolution || '1k');
    const [numOutputs, setNumOutputs] = useState(preset?.numOutputs || 1);
    const [seed, setSeed] = useState<number | undefined>(preset?.seed);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            title, tags, provider, taskType, prompt, negativePrompt,
            aspectRatio, outputResolution, numOutputs, seed
        };

        if (preset) {
            await updatePreset(preset.id, data);
        } else {
            await createPreset(data);
        }
        setShowOpen(false);
    };

    return (
        <Dialog open={showOpen} onOpenChange={setShowOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{preset ? 'Edit Preset' : 'New Preset'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Title</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Tags (comma separated)</Label>
                        <Input value={tags} onChange={e => setTags(e.target.value)} />
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
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Prompt</Label>
                        <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="h-24" required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Negative Prompt</Label>
                        <Input value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Aspect Ratio</Label>
                            <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1:1">1:1</SelectItem>
                                    <SelectItem value="2:3">2:3</SelectItem>
                                    <SelectItem value="3:2">3:2</SelectItem>
                                    <SelectItem value="3:4">3:4</SelectItem>
                                    <SelectItem value="4:3">4:3</SelectItem>
                                    <SelectItem value="9:16">9:16</SelectItem>
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
                            <Input type="number" min={1} max={4} value={numOutputs} onChange={e => setNumOutputs(parseInt(e.target.value))} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Seed</Label>
                            <Input type="number" placeholder="Random" value={seed || ''} onChange={e => setSeed(e.target.value ? parseInt(e.target.value) : undefined)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowOpen(false)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
