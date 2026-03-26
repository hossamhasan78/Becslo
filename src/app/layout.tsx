import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/context/AuthContext';
import { WizardProvider } from '@/lib/context/WizardContext';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Becslo",
  description: "Freelance Design Fee Calculator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GlobalErrorBoundary>
          <AuthProvider>
            <WizardProvider>
              {children}
            </WizardProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}

