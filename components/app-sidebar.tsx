'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, List, Wand2, Images, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const sidebarItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Presets', href: '/presets', icon: List },
    { name: 'Generate', href: '/generate', icon: Wand2 },
    { name: 'Gallery', href: '/gallery', icon: Images },
    { name: 'Settings', href: '/settings', icon: Settings },
];

import Image from 'next/image';

// ... imports

export function AppSidebar() {
    const pathname = usePathname();

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
                    {sidebarItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                        >
                            <Button
                                variant={pathname === item.href ? 'secondary' : 'ghost'}
                                className={cn(
                                    'w-full justify-start gap-2',
                                    pathname === item.href && 'bg-secondary'
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </ScrollArea>
            <div className="border-t p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
