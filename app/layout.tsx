import type { Metadata } from "next";
import "./globals.css";
import { Orbitron } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import UserSync from '@/components/UserSync';

const orbitron = Orbitron({
  subsets: ["latin"],
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
        url: "/logo.svg",
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
    images: ["/logo.svg"],
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
    apple: "/logo.svg"
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <body className={orbitron.className}>
          <UserSync />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
