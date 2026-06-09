import type { Metadata, Viewport } from "next";
import { ClientProviders } from "@/context/client-provider";
import localFont from "next/font/local";
import "../styles/globals.css";
import PageProgressBar from "@/components/shared/progress/global-n-progress";
import { ScrollToTop } from "@/components/shared/common/scroll-to-top";
import { AuthProvider } from "@/context/auth-provider";

const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tiffany Furniture Cambodia",
  description: "Tiffany Furniture Cambodia - E-commerce Platform",
};

/**
 * Viewport config:
 * - Mobile: maximum-scale=1 + user-scalable=no disables pinch-to-zoom and
 *   prevents Safari's automatic zoom on input focus (font-size < 16px).
 * - Desktop: viewport meta is ignored for Ctrl+/- zoom — those always work.
 * - viewportFit=cover extends content behind notches on iPhone X+.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <ClientProviders>
          <AuthProvider>
            <PageProgressBar />
            {children}
            <ScrollToTop />
          </AuthProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
