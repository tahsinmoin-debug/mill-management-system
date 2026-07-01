import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname === '/';
      
      const isProtected = 
        nextUrl.pathname.startsWith('/dashboard') || 
        nextUrl.pathname.startsWith('/entry') ||
        nextUrl.pathname.startsWith('/machines') ||
        nextUrl.pathname.startsWith('/workers') ||
        nextUrl.pathname.startsWith('/reports') ||
        nextUrl.pathname.startsWith('/settings');

      if (isProtected) {
        if (!isLoggedIn) return false; // Redirects to signIn page
        
        // Admin-only routes
        if (nextUrl.pathname.startsWith('/settings')) {
          const userRole = (auth?.user as any)?.role;
          if (userRole !== "ADMIN") {
            return Response.redirect(new URL('/dashboard', nextUrl));
          }
        }
        
        return true;
      } else if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      return true;
    },
  },
} satisfies NextAuthConfig;
