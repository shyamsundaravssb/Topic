import type { Metadata } from "next";
import { Outfit, Lora } from "next/font/google"; // 1. Import new fonts
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

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
      <body className={`${outfit.variable} ${lora.variable} antialiased`}>
        {/* 5. Wrap everything in SessionProvider */}
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
