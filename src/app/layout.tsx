import type { Metadata } from "next";
import { Fraunces, Source_Serif_4 } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToasterProvider } from "@/components/providers/ToasterProvider";
import "./globals.css";

const heading = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Content Manager",
  description: "Mini CMS with integrated AI tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable}`}>
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <ToasterProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
