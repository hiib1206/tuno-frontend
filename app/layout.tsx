import { AuthProvider } from "@/components/AuthProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { Toaster } from "@/components/ToastProvider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata, Viewport } from "next";
import { Bungee_Shade, Instrument_Sans } from "next/font/google";
import "./globals.css";

/**
 * 삼성 인터넷 등 모바일 브라우저의 강제 다크모드 변환을 방지한다.
 * Next.js가 자동으로 head 최상단에 `<meta name="color-scheme">` 태그를 렌더링한다.
 */
export const viewport: Viewport = {
  colorScheme: "light dark",
};

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

const bungeeShade = Bungee_Shade({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-bungee-shade",
});

export const metadata: Metadata = {
  title: "Tuno - AI 투자 분석 플랫폼",
  description:
    "AI 기반 투자 분석 플랫폼. 퀀트 시그널 탐색과 기술적 매수 타이밍 분석을 한 곳에서. Tuno에서 시작하세요.",
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-icon-180x180.png",
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
      className={`${instrumentSans.variable} ${bungeeShade.variable}`}
    >
      <body className={`font-sans antialiased bg-background-2`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            <TooltipProvider>
              <AuthProvider />
              {children}
              <Toaster />
              {/* <Analytics는 vercel에 정보 보내서 분석하는 서비스이므로 일단 주석처리 */}
              {/* <Analytics /> */}
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
