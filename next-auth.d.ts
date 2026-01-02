import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  username: string;
  dob: string;
  isProfileComplete: boolean;
  provider?: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

// Also extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    isProfileComplete?: boolean;
    username?: string;
    dob?: string;
    provider?: string;
  }
}
