import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Marto Marketplace | Curated Multi-Vendor Commerce in Pakistan",
  description:
    "Discover verified Pakistani merchants and authentic products across Marto Marketplace with single-seller order dispatch and transparent PKR pricing.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Marto Marketplace | Curated Multi-Vendor Commerce in Pakistan",
    description:
      "Discover verified Pakistani merchants and authentic products across Marto Marketplace with single-seller order dispatch and transparent PKR pricing.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marto Marketplace | Curated Multi-Vendor Commerce in Pakistan",
    description:
      "Discover verified Pakistani merchants and authentic products across Marto Marketplace with single-seller order dispatch and transparent PKR pricing.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-surface-page text-on-surface font-sans antialiased min-h-screen selection:bg-primary-container selection:text-on-primary"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-primary-container focus:text-on-primary focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
