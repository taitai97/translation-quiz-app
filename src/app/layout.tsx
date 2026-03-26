import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationWrapper from "@/components/NavigationWrapper";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/OfflineBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://translation-quiz-app.vercel.app"),
  title: "Translingo",
  description: "翻訳と復習が同時にできるアプリ。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Translingo",
  },
  openGraph: {
    title: "Translingo",
    description: "翻訳と復習が同時にできるアプリ。",
    type: "website",
    images: [{ url: "/ogp.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Translingo",
    description: "翻訳と復習が同時にできるアプリ。",
    images: ["/ogp.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ServiceWorkerRegistrar />
        <InstallPrompt />
        <OfflineBanner />
        <div className="min-h-screen bg-gray-50 pb-nav-safe">
          <main className="max-w-lg mx-auto px-4 pt-6">
            {children}
          </main>
        </div>
        <NavigationWrapper />
      </body>
    </html>
  );
}
