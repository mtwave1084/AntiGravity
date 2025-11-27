import { getPresets } from '@/app/actions';
import { GeneratorForm } from '@/components/generator-form';

export default async function GeneratePage() {
    const presets = await getPresets();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Generate</h2>
                <p className="text-muted-foreground">Create new images using Nanobanana models.</p>
            </div>
            <GeneratorForm presets={presets} />
        </div>
    );
}
