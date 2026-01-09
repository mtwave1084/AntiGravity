'use client';

import { cn } from '@/lib/utils';
import { DIAGRAM_STRUCTURES, DiagramStructure } from '@/lib/diagram-agent';

interface StructureSelectorProps {
    value: DiagramStructure;
    onChange: (structure: DiagramStructure) => void;
}

export function StructureSelector({ value, onChange }: StructureSelectorProps) {
    const structures = Object.entries(DIAGRAM_STRUCTURES) as [DiagramStructure, typeof DIAGRAM_STRUCTURES[DiagramStructure]][];

    return (
        <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">図解構造</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {structures.map(([key, info]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onChange(key)}
                        className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                            value === key
                                ? 'border-secondary bg-secondary/10 shadow-md scale-105'
                                : 'border-border hover:border-secondary/50 hover:bg-secondary/5'
                        )}
                    >
                        <span className="text-2xl">{info.icon}</span>
                        <span className="text-sm font-medium">{info.label}</span>
                        <span className="text-xs text-muted-foreground text-center">
                            {info.description}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
