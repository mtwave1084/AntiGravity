'use client';

import { useState } from 'react';
import { saveApiKey } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Save } from 'lucide-react';

interface ApiKeyFormProps {
    apiKeys: Record<string, string>;
}

export function ApiKeyForm({ apiKeys }: ApiKeyFormProps) {
    const [nanoKey, setNanoKey] = useState(apiKeys['nanobanana'] || '');
    const [proKey, setProKey] = useState(apiKeys['nanobanana-pro'] || '');
    const [veoKey, setVeoKey] = useState(apiKeys['veo'] || '');
    const [showNano, setShowNano] = useState(false);
    const [showPro, setShowPro] = useState(false);
    const [showVeo, setShowVeo] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            if (nanoKey) await saveApiKey('nanobanana', nanoKey);
            if (proKey) await saveApiKey('nanobanana-pro', proKey);
            if (veoKey) await saveApiKey('veo', veoKey);
            setMessage('API Keys saved successfully.');
        } catch (e: any) {
            setMessage('Error saving keys: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                    Manage your API keys for AI generation services. Keys are stored encrypted.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Image Generation Keys */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">画像生成</h3>

                    <div className="grid gap-2">
                        <Label>Nanobanana API Key (Gemini 2.5 Flash Image)</Label>
                        <div className="flex gap-2">
                            <Input
                                type={showNano ? 'text' : 'password'}
                                value={nanoKey}
                                onChange={e => setNanoKey(e.target.value)}
                                placeholder="Enter key..."
                            />
                            <Button variant="ghost" size="icon" onClick={() => setShowNano(!showNano)}>
                                {showNano ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Nanobanana Pro API Key (Gemini 3 Pro)</Label>
                        <div className="flex gap-2">
                            <Input
                                type={showPro ? 'text' : 'password'}
                                value={proKey}
                                onChange={e => setProKey(e.target.value)}
                                placeholder="Enter key..."
                            />
                            <Button variant="ghost" size="icon" onClick={() => setShowPro(!showPro)}>
                                {showPro ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Video Generation Keys */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground">動画生成</h3>

                    <div className="grid gap-2">
                        <Label>Veo API Key (動画生成用)</Label>
                        <div className="flex gap-2">
                            <Input
                                type={showVeo ? 'text' : 'password'}
                                value={veoKey}
                                onChange={e => setVeoKey(e.target.value)}
                                placeholder="Enter key..."
                            />
                            <Button variant="ghost" size="icon" onClick={() => setShowVeo(!showVeo)}>
                                {showVeo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Veo 3.1, 3.0, 2.0 モデルによる動画生成に使用
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-green-600">{message}</p>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" /> Save Keys
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
