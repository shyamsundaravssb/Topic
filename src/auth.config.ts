import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    // ✅ MOVED HERE: This allows the Middleware to see custom fields
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      // Map the custom fields from Token to Session
      if (token.isProfileComplete !== undefined) {
        // @ts-ignore
        session.user.isProfileComplete = token.isProfileComplete as boolean;
      }

      if (token.username) {
        // @ts-ignore
        session.user.username = token.username as string;
      }

      // Also map provider if you need it later
      if (token.provider) {
        // @ts-ignore
        session.user.provider = token.provider as string;
      }

      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
