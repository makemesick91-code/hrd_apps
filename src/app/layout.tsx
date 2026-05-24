import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Daengtisia HR Suite - Enterprise HR Platform",
    template: "%s | Daengtisia HR Suite",
  },
  description:
    "Platform HR enterprise terlengkap untuk mengelola karyawan, absensi, payroll, rekrutmen, dan performa. Sistem HRD modern untuk bisnis Indonesia.",
  keywords: ["HR", "HRD", "payroll", "absensi", "rekrutmen", "karyawan", "enterprise"],
  authors: [{ name: "Daengtisia Corporation" }],
  creator: "Daengtisia Corporation",
  openGraph: {
    type: "website",
    title: "Daengtisia HR Suite",
    description: "Platform HR enterprise all-in-one untuk bisnis modern Indonesia",
    siteName: "Daengtisia HR Suite",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                background: "#fff",
                color: "#111827",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#fff",
                },
              },
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
