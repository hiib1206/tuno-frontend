import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ToastProvider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "InvestAI - AI 기반 자동 주식 투자 플랫폼",
  description:
    "AI 알고리즘을 활용한 자동화된 포트폴리오 관리. 감정을 배제한 데이터 기반 투자로 합리적인 의사결정을 지원합니다.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={instrumentSans.variable}
    >
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider />
          {children}
          <Toaster />
          {/* <Analytics는 vercel에 정보 보내서 분석하는 서비스이므로 일단 주석처리 */}
          {/* <Analytics /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
