'use client';

import { deletePreset } from '@/app/actions';
import { PresetDialog } from '@/components/preset-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Play, Edit, Trash } from 'lucide-react';
import Link from 'next/link';

interface PresetsListProps {
    presets: any[];
}

export function PresetsList({ presets }: PresetsListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {presets.map((preset) => (
                <Card key={preset.id} className="relative group">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {preset.title}
                        </CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <PresetDialog
                                    preset={preset}
                                    trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>}
                                />
                                <DropdownMenuItem onClick={() => deletePreset(preset.id)} className="text-red-600">
                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-4">
                            {preset.prompt}
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1 flex-wrap">
                                {preset.tags?.split(',').map((tag: string) => (
                                    <span key={tag} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                            <Link href={`/generate?preset=${preset.id}`}>
                                <Button size="sm" variant="secondary">
                                    <Play className="mr-2 h-4 w-4" /> Use
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
