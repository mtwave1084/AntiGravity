import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnLogin = nextUrl.pathname.startsWith('/login');

            // Allow access to static files and API routes (handled by matcher in middleware usually, but good to be safe)
            if (nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.startsWith('/api')) {
                return true;
            }

            if (isOnLogin) {
                if (isLoggedIn) {
                    return Response.redirect(new URL('/', nextUrl));
                }
                return true;
            }

            if (!isLoggedIn) {
                return false; // Redirect unauthenticated users to login page
            }

            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
