'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, List, Wand2, Images, Settings, LogOut, LayoutGrid, FileImage, Film, Clapperboard } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

const sidebarItems = [
    { name: 'ダッシュボード', href: '/', icon: LayoutDashboard },
    { name: 'プリセット', href: '/presets', icon: List },
    { name: '自由生成', href: '/generate?mode=free', icon: Wand2 },
    { name: '図解生成', href: '/generate?mode=diagram', icon: LayoutGrid },
    { name: '動画生成', href: '/generate?mode=video', icon: Film },
    { name: 'ギャラリー', href: '/gallery', icon: Images },
    { name: '図解ギャラリー', href: '/diagram-gallery', icon: FileImage },
    { name: '動画ギャラリー', href: '/video-gallery', icon: Clapperboard },
    { name: '設定', href: '/settings', icon: Settings },
];

// Helper to check if current path matches item href (handles query params)
function isActiveItem(pathname: string, searchParams: URLSearchParams, href: string): boolean {
    const [itemPath, itemQuery] = href.split('?');

    // Check pathname match first
    if (pathname !== itemPath) return false;

    // If no query in href, match by pathname only
    if (!itemQuery) return true;

    // Check query params match
    const itemParams = new URLSearchParams(itemQuery);
    for (const [key, value] of itemParams.entries()) {
        if (searchParams.get(key) !== value) return false;
    }
    return true;
}

export function AppSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
            <div className="flex flex-col items-center border-b p-6 bg-sidebar-accent/30">
                <div className="relative w-40 h-40 mb-3">
                    <Image
                        src="/banana-shaker-mascot.png"
                        alt="Banana Shaker Mascot"
                        fill
                        className="object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300"
                        priority
                    />
                </div>
                <Link href="/" className="flex items-center gap-2 font-bold text-primary">
                    <span className="text-2xl tracking-tight drop-shadow-sm">Banana Shaker</span>
                </Link>
            </div>
            <ScrollArea className="flex-1 py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const isActive = isActiveItem(pathname, searchParams, item.href);
                        return (
                            <Link
                                key={index}
                                href={item.href}
                            >
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    className={cn(
                                        'w-full justify-start gap-2',
                                        isActive && 'bg-secondary'
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>
            <div className="border-t p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                </Button>
            </div>
        </div>
    );
}
