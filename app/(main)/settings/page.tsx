import { getApiKeys } from '@/app/actions';
import { ApiKeyForm } from '@/components/api-key-form';

export default async function SettingsPage() {
    const apiKeys = await getApiKeys();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your application settings.</p>
            </div>
            <ApiKeyForm apiKeys={apiKeys} />
        </div>
    );
}
