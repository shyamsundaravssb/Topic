"use server";

import { signOut } from "@/auth";

export const logout = async () => {
  // Pass redirectTo to send them back to login page after sign out
  await signOut({ redirectTo: "/auth/login" });
};
