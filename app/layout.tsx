import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Astra Chat",
  description: "Chatbot AI modern terintegrasi — cepat, cerdas, dan intuitif.",
  keywords: ["AI", "chatbot", "gemini", "google", "artificial intelligence"],
  openGraph: {
    title: "Astra Chat",
    description: "Chatbot AI modern terintegrasi",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="id" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
