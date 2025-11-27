'use client';

import { usePathname } from 'next/navigation';

export function SiteHeader() {
    const pathname = usePathname();

    const getTitle = () => {
        if (pathname === '/') return 'Dashboard';
        if (pathname.startsWith('/presets')) return 'Presets';
        if (pathname.startsWith('/generate')) return 'Generate';
        if (pathname.startsWith('/gallery')) return 'Gallery';
        if (pathname.startsWith('/settings')) return 'Settings';
        return 'Banana Shaker';
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
                <h1 className="text-lg font-semibold">{getTitle()}</h1>
            </div>
        </header>
    );
}
