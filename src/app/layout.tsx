import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { VisitCounterProvider } from "@/components/analytics/visit-counter";
import "sweetalert2/dist/sweetalert2.min.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Thrie Jie B. Barcina | BSIT Student Portfolio",
    template: "%s | Thrie Jie B. Barcina",
  },
  description:
    "Thrie Jie B. Barcina — 4th-year BS Information Technology student at Bukidnon State University seeking an OJT internship. Explore projects, skills, certificates, and professional portfolio.",
  keywords: [
    "Thrie Jie Barcina",
    "BSIT",
    "OJT Intern",
    "Portfolio",
    "Information Technology",
    "Bukidnon State University",
    "Philippines",
    "UI/UX",
    "Graphic Design",
  ],
  authors: [{ name: "Thrie Jie B. Barcina" }],
  creator: "Thrie Jie B. Barcina",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://example.com",
    siteName: "Thrie Jie B. Barcina Portfolio",
    title: "Thrie Jie B. Barcina | BSIT Student Portfolio",
    description:
      "4th-year BS Information Technology student at Bukidnon State University seeking an OJT internship. Explore projects, skills, certificates, and professional portfolio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thrie Jie B. Barcina | BSIT Student Portfolio",
    description:
      "4th-year BS Information Technology student at Bukidnon State University seeking an OJT internship. Explore projects, skills, certificates, and professional portfolio.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <VisitCounterProvider>{children}</VisitCounterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
