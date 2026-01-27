'use client';

import { startTransition, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Wand2, LayoutGrid, Film } from 'lucide-react';

export type GenerationMode = 'free' | 'diagram' | 'video';

interface ModeSwitcherProps {
    freeMode: React.ReactNode;
    diagramMode: React.ReactNode;
    videoMode: React.ReactNode;
}

export function ModeSwitcher({ freeMode, diagramMode, videoMode }: ModeSwitcherProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get mode from URL, default to 'free'
    const urlMode = searchParams.get('mode') as GenerationMode | null;
    const [mode, setMode] = useState<GenerationMode>(() => {
        if (urlMode === 'diagram') return 'diagram';
        if (urlMode === 'video') return 'video';
        return 'free';
    });
    const [isPending, setIsPending] = useState(false);

    // Sync mode state with URL changes (e.g., browser back/forward, direct link)
    useEffect(() => {
        let newMode: GenerationMode = 'free';
        if (urlMode === 'diagram') newMode = 'diagram';
        else if (urlMode === 'video') newMode = 'video';

        if (newMode !== mode) {
            setMode(newMode);
        }
    }, [urlMode]);

    const handleModeChange = (newMode: GenerationMode) => {
        setIsPending(true);
        startTransition(() => {
            setMode(newMode);

            // Update URL without full navigation
            const params = new URLSearchParams(searchParams);
            params.set('mode', newMode);
            // Remove mode-specific params when switching
            if (newMode !== 'free') {
                params.delete('preset');
            }
            router.replace(`/generate?${params.toString()}`);
            setIsPending(false);
        });
    };

    const renderContent = () => {
        switch (mode) {
            case 'diagram':
                return diagramMode;
            case 'video':
                return videoMode;
            default:
                return freeMode;
        }
    };

    return (
        <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex rounded-2xl bg-muted p-1.5 shadow-inner">
                    <button
                        onClick={() => handleModeChange('free')}
                        className={cn(
                            'flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300',
                            mode === 'free'
                                ? 'bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg transform scale-105'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                        )}
                        disabled={isPending}
                    >
                        <Wand2 className="h-5 w-5" />
                        自由生成
                    </button>
                    <button
                        onClick={() => handleModeChange('diagram')}
                        className={cn(
                            'flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300',
                            mode === 'diagram'
                                ? 'bg-gradient-to-r from-secondary to-green-400 text-white shadow-lg transform scale-105'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                        )}
                        disabled={isPending}
                    >
                        <LayoutGrid className="h-5 w-5" />
                        図解生成
                    </button>
                    <button
                        onClick={() => handleModeChange('video')}
                        className={cn(
                            'flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300',
                            mode === 'video'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                        )}
                        disabled={isPending}
                    >
                        <Film className="h-5 w-5" />
                        動画生成
                    </button>
                </div>
            </div>

            {/* Mode Content */}
            <div className={cn(
                'transition-opacity duration-300',
                isPending ? 'opacity-50' : 'opacity-100'
            )}>
                {renderContent()}
            </div>
        </div>
    );
}
