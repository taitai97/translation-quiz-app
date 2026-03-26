import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationWrapper from "@/components/NavigationWrapper";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import InstallPrompt from "@/components/InstallPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "翻訳クイズ",
  description: "翻訳しながら単語を記憶するフラッシュカードアプリ",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "翻訳クイズ",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ServiceWorkerRegistrar />
        <InstallPrompt />
        <div className="min-h-screen bg-gray-50 pb-20">
          <main className="max-w-lg mx-auto px-4 pt-6">
            {children}
          </main>
        </div>
        <NavigationWrapper />
      </body>
    </html>
  );
}
