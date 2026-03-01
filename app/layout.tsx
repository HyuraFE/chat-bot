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

'use client';

import { App } from '@capacitor/app';
import { useEffect } from 'react';

function CapacitorListener() {
  useEffect(() => {
    const initApp = async () => {
      // Check if we are running in a Capacitor context
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        App.addListener('appUrlOpen', (data) => {
          console.log('App opened with URL:', data.url);
          const url = new URL(data.url);
          const clerkToken = url.searchParams.get('__clerk_db_jwt');
          if (clerkToken) {
            // Redirect to root with the token so Clerk can process it
            window.location.href = `/?__clerk_db_jwt=${clerkToken}`;
          }
        });
      }
    };

    initApp();
  }, []);

  return null;
}

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
        <body className="antialiased">
          <CapacitorListener />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
