import { getPresets } from '@/app/actions';
import { PresetsList } from '@/components/presets-list';
import { PresetDialog } from '@/components/preset-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function PresetsPage() {
    const presets = await getPresets();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Presets</h2>
                    <p className="text-muted-foreground">Manage your generation templates.</p>
                </div>
                <PresetDialog trigger={
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Preset
                    </Button>
                } />
            </div>
            <PresetsList presets={presets} />
        </div>
    );
}
