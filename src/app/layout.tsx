import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JavaScript Compiler - Run JS Code Online",
  description:
    "Real-time JavaScript compiler with auto-completion and interactive console. Write, run, and debug JS code directly in your browser.",
  keywords: [
    "JavaScript compiler",
    "online JS editor",
    "run JavaScript online",
    "code playground",
    "JavaScript IDE",
    "real-time code execution",
    "JavaScript debugging",
    "JavaScript console",
    "JavaScript code editor",
  ],
  openGraph: {
    title: "JavaScript Compiler - Run JS Code Online",
    description:
      "Real-time JavaScript compiler with auto-completion and interactive console.",
    url: "https://yourdomain.com",
    siteName: "JS Compiler",
    images: [
      {
        url: "https://yourdomain.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JavaScript Compiler - Run JS Code Online",
    description:
      "Real-time JavaScript compiler with auto-completion and interactive console.",
    images: ["https://yourdomain.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
