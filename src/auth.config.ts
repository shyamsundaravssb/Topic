import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login", // Redirect here if not logged in
    error: "/auth/error", // Redirect here on auth errors
  },
  callbacks: {
    // 1. Check if user is allowed to access the route
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith("/topics") ||
        nextUrl.pathname.startsWith("/create");
      const isOnAuth = nextUrl.pathname.startsWith("/auth");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }
      return true;
    },
    // 2. Add User ID and custom fields to the session
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      // We will map these in auth.ts
      if (token.username) {
        // @ts-ignore
        session.user.username = token.username as string;
      }
      if (token.age) {
        // @ts-ignore
        session.user.age = token.age as number;
      }
      return session;
    },
    // 3. Add custom fields to the JWT token
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // @ts-ignore
        token.username = user.username;
        // @ts-ignore
        token.age = user.age;
      }
      return token;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
