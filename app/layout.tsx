import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/eatutori/theme-provider";
import "./globals.css";
import { Footer } from "@/components/eatutori/footer";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Eatutori - The world's most comprehensive learning platform",
  description:
    "A fun, gamified, Cambridge International Syllabus, powered learning platform for primary school students aged 5-18",
  icons: {
    icon: [
      {
        url: "/app/favicon.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/app/favicon.ico",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/app/favicon.ico",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2DD4BF",
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.className} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}

