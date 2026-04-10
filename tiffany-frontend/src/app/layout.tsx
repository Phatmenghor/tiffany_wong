import type { Metadata } from "next";
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
