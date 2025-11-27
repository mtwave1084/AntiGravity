import { getPresets, getHistory } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
    const presets = await getPresets();
    const history = await getHistory();

    const recentPresets = presets.slice(0, 5);
    const recentImages = history.slice(0, 8);

    return (
        <div className="space-y-8">
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Recent Presets</h2>
                    <Link href="/presets">
                        <Button variant="outline">View All</Button>
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recentPresets.map((preset: any) => (
                        <Link key={preset.id} href={`/generate?preset=${preset.id}`}>
                            <Card className="hover:bg-accent transition-colors cursor-pointer">
                                <CardHeader>
                                    <CardTitle>{preset.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground truncate">{preset.prompt}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {recentPresets.length === 0 && (
                        <p className="text-muted-foreground">No presets yet.</p>
                    )}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Recent Generations</h2>
                    <Link href="/gallery">
                        <Button variant="outline">View Gallery</Button>
                    </Link>
                </div>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {recentImages.map((img: any) => (
                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`data:${img.mimeType};base64,${img.dataBase64}`}
                                alt={img.label || 'Generated Image'}
                                className="object-cover w-full h-full hover:scale-105 transition-transform"
                            />
                        </div>
                    ))}
                    {recentImages.length === 0 && (
                        <p className="text-muted-foreground">No images yet.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
