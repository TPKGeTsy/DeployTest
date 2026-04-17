import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Providers from "./Providers";
import GlobalPlayer from "@/components/GlobalPlayer";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lyrical Nihongo",
  description: "Learn Japanese through music",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-mono", jetbrainsMono.variable)}
      >
      <body className="min-h-full flex flex-col bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]">
        <Providers>
          <Navbar />
          <main className="container pt-10">
          {children}
          </main>
          <GlobalPlayer />
        </Providers>
        </body>
    </html>
      </ClerkProvider>
  );
}
