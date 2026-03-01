import type { Metadata } from "next";
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
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
