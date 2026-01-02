import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react"; // 1. Import Provider
import { auth } from "@/auth"; // 2. Import auth to fetch session
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Topic App",
  description: "A community platform",
};

// 3. Make the Layout async so we can await auth()
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 4. Fetch the session on the server
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 5. Wrap everything in SessionProvider */}
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
