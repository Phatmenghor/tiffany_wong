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
  description: "Tiffany Furniture Cambodia – Shop premium furniture online.",
  applicationName: "Tiffany Furniture Cambodia",
  manifest: "/manifest.json",

  // Apple PWA
  appleWebApp: {
    capable: true,
    title: "Tiffany",
    statusBarStyle: "default",
  },

  // Standard PWA icons / touch icons
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },

  formatDetection: {
    telephone: false,   // prevent iOS from auto-linking phone numbers
  },
};

/**
 * Viewport config:
 * - Mobile: maximum-scale=1 + user-scalable=no disables pinch-to-zoom and
 *   prevents Safari's automatic zoom on input focus (font-size < 16px).
 * - Desktop: viewport meta is ignored for Ctrl+/- zoom — those always work.
 * - viewportFit=cover extends content behind notches/dynamic-islands (iPhone X+).
 * - themeColor: tints the browser chrome / status bar on Android & Safari.
 * - interactiveWidget=resizes-visual: keyboard resizes the visual viewport only,
 *   preventing layout shift when the soft keyboard opens (Chrome 108+).
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#57823D" },
    { media: "(prefers-color-scheme: dark)",  color: "#476B32" },
  ],
  interactiveWidget: "resizes-visual",
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
