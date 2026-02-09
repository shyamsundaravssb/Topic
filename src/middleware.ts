import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isAuthRoute = pathname.startsWith("/auth");

  // Keep "/" private? If yes, leave empty.
  const publicRoutes: string[] = ["/api/cron/run-agent"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // ✅ CHECK ONLY THE FLAG
  // We trust this because:
  // 1. Credential Signup sets this to TRUE.
  // 2. Google Signup defaults this to FALSE.
  // @ts-ignore
  const isProfileComplete = req.auth?.user?.isProfileComplete === true;

  // 1. Always allow API Auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // 2. Auth Pages Logic (Login, Register, etc.)
  if (isAuthRoute) {
    if (isLoggedIn) {
      // A. If profile is INCOMPLETE, force them to the form
      if (!isProfileComplete) {
        // Prevent loop if already there
        if (pathname === "/auth/complete-profile") return NextResponse.next();
        return NextResponse.redirect(
          new URL("/auth/complete-profile", nextUrl),
        );
      }

      // B. If profile is COMPLETE, get them out of Auth pages
      // (Allow "new-verification" page to stay visible if needed)
      if (pathname === "/auth/new-verification") return NextResponse.next();

      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  // 3. Protected Routes & Global Guard
  if (isLoggedIn) {
    // If logged in but incomplete, BLOCK access to everything (except the form)
    if (!isProfileComplete) {
      if (pathname === "/auth/complete-profile") return NextResponse.next();
      return NextResponse.redirect(new URL("/auth/complete-profile", nextUrl));
    }
  }

  // 4. Redirect unauthenticated users on Protected Routes
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = pathname;
    if (nextUrl.search) callbackUrl += nextUrl.search;
    return NextResponse.redirect(
      new URL(
        `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        nextUrl,
      ),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|webp|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
