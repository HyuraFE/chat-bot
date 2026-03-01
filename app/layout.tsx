import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "Gemini AI Chat",
  description: "Chatbot AI modern berbasis Google Gemini — cepat, cerdas, dan intuitif.",
  keywords: ["AI", "chatbot", "gemini", "google", "artificial intelligence"],
  openGraph: {
    title: "Gemini AI Chat",
    description: "Chatbot AI modern berbasis Google Gemini",
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
