'use client';

import { cn } from '@/lib/utils';
import { DIAGRAM_STYLES, DiagramStyle } from '@/lib/diagram-agent';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface StyleSelectorProps {
    value: DiagramStyle;
    onChange: (style: DiagramStyle) => void;
}

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
    const styles = Object.entries(DIAGRAM_STYLES) as [DiagramStyle, typeof DIAGRAM_STYLES[DiagramStyle]][];

    return (
        <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">デザインスタイル</label>
            <ScrollArea className="w-full whitespace-nowrap rounded-xl border p-2">
                <div className="flex gap-2">
                    {styles.map(([key, info]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onChange(key)}
                            className={cn(
                                'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 min-w-[100px] transition-all duration-200',
                                value === key
                                    ? 'border-secondary bg-secondary/10 shadow-md'
                                    : 'border-transparent hover:border-secondary/50 hover:bg-secondary/5'
                            )}
                        >
                            <span className="text-sm font-medium whitespace-nowrap">{info.label}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {info.description}
                            </span>
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
