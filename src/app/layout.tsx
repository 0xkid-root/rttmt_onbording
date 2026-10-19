import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RTMT Merchant Onboarding — Real-Time Transaction Monitoring",
  description:
    "Production-quality merchant onboarding gateway for RTMT (Real-Time Transaction Monitoring & Threat Intelligence Platform).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
