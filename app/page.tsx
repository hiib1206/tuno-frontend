"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, BarChart3, Shield, Zap, ChevronDown, LineChart, Target, Sparkles } from "lucide-react"

const ThreeBackground = dynamic(() => import("@/components/three-background"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 -z-10 bg-gradient-to-b from-accent-light via-background to-background" />
  ),
})

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      const sections = document.querySelectorAll(".animate-section")
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const id = section.getAttribute("data-section")
        if (rect.top < window.innerHeight * 0.8 && id) {
          setIsVisible((prev) => ({ ...prev, [id]: true }))
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden bg-black">
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">Foresight AI</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              기능
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              작동 원리
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              요금제
            </Link>
            <Link href="/analysis">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent-dark">
                시작하기
              </Button>
            </Link>
          </nav>

          <Link href="/login" className="md:hidden">
            <Button size="sm" variant="ghost">
              로그인
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent-10 px-4 py-2 text-sm font-medium text-accent-dark">
            <Sparkles className="h-4 w-4" />
            AI 기반 주가 예측 플랫폼
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            미래를 예측하는
            <br />
            <span className="bg-gradient-to-r from-accent-dark to-accent bg-clip-text text-transparent">
              지능형 투자
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            과거 데이터를 학습한 AI가 미래 주가를 예측합니다.
            <br />
            감정적 투자를 배제하고 데이터 기반의 합리적인 투자 결정을 내리세요.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/analysis">
              <Button size="lg" className="group bg-accent text-accent-foreground hover:bg-accent-dark">
                무료로 시작하기
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline">
                작동 원리 보기
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8">
            <div>
              <div className="mb-2 text-3xl font-bold text-accent-dark">98.7%</div>
              <div className="text-sm text-muted-foreground">예측 정확도</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-accent-dark">50K+</div>
              <div className="text-sm text-muted-foreground">활성 사용자</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-accent-dark">₩2.3T</div>
              <div className="text-sm text-muted-foreground">분석된 자산</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
          }}
          className="absolute bottom-8 animate-bounce"
        >
          <ChevronDown className="h-8 w-8 text-muted-foreground" />
        </button>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="animate-section relative bg-background/80 backdrop-blur-sm py-24"
        data-section="features"
        style={{
          opacity: isVisible.features ? 1 : 0,
          transform: isVisible.features ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.8s ease-out",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">AI가 제공하는 핵심 기능</h2>
            <p className="text-lg text-muted-foreground">전문 투자자 수준의 분석을 AI로 누구나 쉽게</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Brain,
                title: "딥러닝 예측",
                description: "수천만 건의 거래 데이터를 학습한 AI가 미래 주가를 정확하게 예측합니다.",
              },
              {
                icon: BarChart3,
                title: "실시간 분석",
                description: "시장 데이터를 실시간으로 분석하여 최신 투자 인사이트를 제공합니다.",
              },
              {
                icon: Target,
                title: "맞춤형 추천",
                description: "투자 성향과 목표에 맞는 종목을 AI가 자동으로 추천해드립니다.",
              },
              {
                icon: Shield,
                title: "리스크 관리",
                description: "포트폴리오 리스크를 분석하고 최적의 자산 배분을 제안합니다.",
              },
              {
                icon: Zap,
                title: "빠른 의사결정",
                description: "복잡한 분석을 몇 초 만에 완료하여 빠른 투자 결정을 지원합니다.",
              },
              {
                icon: LineChart,
                title: "성과 추적",
                description: "예측 성과와 투자 수익률을 실시간으로 추적하고 개선합니다.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-accent hover:shadow-lg"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-10 text-accent-dark transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="animate-section relative bg-accent-05/50 backdrop-blur-sm py-24"
        data-section="how-it-works"
        style={{
          opacity: isVisible["how-it-works"] ? 1 : 0,
          transform: isVisible["how-it-works"] ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.8s ease-out",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">3단계로 시작하는 AI 투자</h2>
            <p className="text-lg text-muted-foreground">복잡한 과정 없이 간단하게 시작하세요</p>
          </div>

          <div className="mx-auto max-w-4xl space-y-12">
            {[
              {
                step: "01",
                title: "종목 선택",
                description: "분석하고 싶은 주식 종목을 검색하고 선택합니다.",
              },
              {
                step: "02",
                title: "기간 설정",
                description: "분석 기간을 설정하면 AI가 해당 기간의 데이터를 학습합니다.",
              },
              {
                step: "03",
                title: "예측 확인",
                description: "AI가 예측한 미래 주가와 상세한 분석 리포트를 확인합니다.",
              },
            ].map((step, idx) => (
              <div key={idx} className="flex gap-8">
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="mb-2 text-2xl font-semibold">{step.title}</h3>
                  <p className="text-lg text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/analysis">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent-dark">
                지금 바로 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="animate-section relative py-24" data-section="cta">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-dark to-accent p-12 text-center md:p-20">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                데이터 기반 투자,
                <br />
                지금 시작하세요
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
                Foresight AI와 함께 감정적 투자를 배제하고
                <br />
                합리적인 투자 결정을 내리세요
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-accent-dark hover:bg-white/90">
                    무료로 시작하기
                  </Button>
                </Link>
                <Link href="/analysis">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 bg-transparent"
                  >
                    데모 체험하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border bg-card/80 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="text-xl font-bold">Foresight AI</span>
              </Link>
              <p className="text-sm text-muted-foreground">AI 기반 주가 예측으로 더 나은 투자 결정을 내리세요.</p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">제품</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    기능
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground">
                    요금제
                  </Link>
                </li>
                <li>
                  <Link href="/analysis" className="hover:text-foreground">
                    AI 분석
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">회사</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    소개
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    문의
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2025 Foresight AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
