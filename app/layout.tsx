import type { Metadata } from "next";
import "./globals.css";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "Digital Circuit Simulator | ACM VIT",
    template: "%s | Digital Circuit Simulator"
  },
  description: "A web-based digital logic circuit simulator that allows users to visually design, build, and test digital circuits in their browser without needing physical hardware. Perfect for students, educators, and hobbyists.",
  keywords: [
    "digital circuit simulator",
    "logic gates",
    "electronics",
    "digital logic",
    "circuit design",
    "educational tool",
    "interactive learning",
    "ACM VIT"
  ],
  authors: [{ name: "ACM VIT" }],
  creator: "ACM VIT",
  publisher: "ACM VIT",
  metadataBase: new URL("https://github.com/ACM-VIT/Digital-Circuit-Simulator"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/ACM-VIT/Digital-Circuit-Simulator",
    title: "Digital Circuit Simulator | ACM VIT",
    description: "A web-based digital logic circuit simulator that allows users to visually design, build, and test digital circuits in their browser without needing physical hardware.",
    siteName: "Digital Circuit Simulator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Digital Circuit Simulator - Interactive Logic Gate Design"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Circuit Simulator | ACM VIT",
    description: "A web-based digital logic circuit simulator for designing and testing digital circuits in your browser.",
    images: ["/twitter-image.png"],
    creator: "@acmvit"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
               <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
