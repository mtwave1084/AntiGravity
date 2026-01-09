import { Suspense } from 'react';
import { getPresets } from '@/app/actions';
import { GeneratorForm } from '@/components/generator-form';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { DiagramForm } from '@/components/diagram-generator';

export default async function GeneratePage() {
    const presets = await getPresets() as any[];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Generate</h2>
                <p className="text-muted-foreground">Create images using Nanobanana or diagrams using the agent.</p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <ModeSwitcher
                    freeMode={<GeneratorForm presets={presets} />}
                    diagramMode={<DiagramForm />}
                />
            </Suspense>
        </div>
    );
}
