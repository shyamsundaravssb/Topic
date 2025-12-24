import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // We need to create this next
import { authConfig } from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // We use JWT for flexibility
  providers: [
    // 1. Google Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid profile email https://www.googleapis.com/auth/user.birthday.read",
        },
      },
      profile(profile) {
        // Note: Google doesn't always return birthday in the basic profile
        // We set what we can.
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: new Date(), // Trusted Provider
          // age: null // We will let the user fill this later if Google skips it
        };
      },
    }),

    // 2. Credentials Provider (Email + Password)
    Credentials({
      async authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (!email || !password) return null;

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Check if user exists and has a password (google users don't)
        if (!user || !user.password) return null;

        // Check password match
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        // CRITICAL: Check verification
        if (!user.emailVerified) {
          throw new Error("Email not verified!");
        }

        return user;
      },
    }),
  ],
});
