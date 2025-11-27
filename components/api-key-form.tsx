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
    const [showNano, setShowNano] = useState(false);
    const [showPro, setShowPro] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            if (nanoKey) await saveApiKey('nanobanana', nanoKey);
            if (proKey) await saveApiKey('nanobanana-pro', proKey);
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
                    Manage your API keys for Nanobanana services. Keys are stored encrypted.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label>Nanobanana API Key</Label>
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
                    <Label>Nanobanana Pro API Key</Label>
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

                <div className="flex items-center justify-between">
                    <p className="text-sm text-green-600">{message}</p>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" /> Save Keys
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
