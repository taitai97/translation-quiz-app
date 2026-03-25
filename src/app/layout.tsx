import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationWrapper from "@/components/NavigationWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "翻訳クイズ",
  description: "翻訳しながら単語を記憶するフラッシュカードアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} antialiased`}>
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
