import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Brain,
  TrendingUp,
  Shield,
  BarChart3,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-50 pb-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              (매인 페이지 나중에 수정)
              <br />
              AI가 예측하는
              <br />
              <span className="text-accent">당신의 투자 미래</span>
            </h1>

            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              종목과 기간을 입력하면 AI가 과거 데이터를 분석하여
              <br />
              미래 투자 성과를 예측합니다. 데이터 기반의 합리적인 투자 결정을
              내리세요.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground"
                asChild
              >
                <Link href="/predict">
                  AI 예측 시작하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#demo">데모 보기</Link>
              </Button>
            </div>

            <div className="mt-16 rounded-2xl border border-border bg-card p-4 shadow-2xl">
              <img
                src="/ai-stock-market-prediction-dashboard-with-charts-s.jpg"
                alt="AI 주식 예측 플랫폼"
                className="h-auto w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-accent">95.3%</div>
              <div className="text-sm text-muted-foreground">예측 정확도</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-accent">50,000+</div>
              <div className="text-sm text-muted-foreground">
                분석된 종목 데이터
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-accent">10초</div>
              <div className="text-sm text-muted-foreground">
                평균 예측 시간
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
              왜 InvestAI를 선택해야 할까요?
            </h2>
            <p className="text-pretty text-lg text-muted-foreground">
              AI 기반 데이터 분석으로 합리적인 투자 의사결정을 지원합니다
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Brain className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI 기반 예측</h3>
              <p className="text-muted-foreground">
                머신러닝 알고리즘이 과거 데이터를 학습하여 미래 주가를
                예측합니다
              </p>
            </Card>

            <Card className="border-border p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">빠른 분석</h3>
              <p className="text-muted-foreground">
                종목 코드와 기간만 입력하면 몇 초 안에 상세한 예측 결과를
                제공합니다
              </p>
            </Card>

            <Card className="border-border p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">객관적 분석</h3>
              <p className="text-muted-foreground">
                감정을 배제한 데이터 기반 분석으로 합리적인 투자 판단을 돕습니다
              </p>
            </Card>

            <Card className="border-border p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">상세한 시각화</h3>
              <p className="text-muted-foreground">
                차트와 그래프로 예측 결과를 직관적으로 이해할 수 있습니다
              </p>
            </Card>

            <Card className="border-border p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">과거 데이터 분석</h3>
              <p className="text-muted-foreground">
                수년간의 시장 데이터를 분석하여 패턴을 찾고 미래를 예측합니다
              </p>
            </Card>

            <Card className="border-border p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">쉬운 사용</h3>
              <p className="text-muted-foreground">
                복잡한 금융 지식 없이도 누구나 쉽게 AI 예측을 활용할 수 있습니다
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
              어떻게 작동하나요?
            </h2>
            <p className="text-pretty text-lg text-muted-foreground">
              세 단계로 시작하는 간단한 예측 프로세스
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">종목 & 기간 입력</h3>
              <p className="text-muted-foreground">
                예측하고 싶은 주식 종목과 분석 기간을 선택합니다
              </p>
            </div>

            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI 데이터 분석</h3>
              <p className="text-muted-foreground">
                AI가 해당 기간의 과거 투자 정보를 학습하고 패턴을 분석합니다
              </p>
            </div>

            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">예측 결과 확인</h3>
              <p className="text-muted-foreground">
                상세한 예측 결과와 시각화된 데이터로 투자 의사결정을 내립니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
              투명한 요금제
            </h2>
            <p className="text-pretty text-lg text-muted-foreground">
              투자 규모에 맞는 플랜을 선택하세요
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="border-border p-8">
              <h3 className="mb-2 text-2xl font-bold">스타터</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₩29,000</span>
                <span className="text-muted-foreground">/월</span>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">기본 AI 분석</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">월 10회 자동 거래</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">기본 리포트</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                시작하기
              </Button>
            </Card>

            <Card className="relative border-accent p-8 shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-sm font-semibold text-accent-foreground">
                인기
              </div>
              <h3 className="mb-2 text-2xl font-bold">프로</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₩79,000</span>
                <span className="text-muted-foreground">/월</span>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">고급 AI 분석</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">무제한 자동 거래</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">상세 리포트</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">실시간 알림</span>
                </li>
              </ul>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                시작하기
              </Button>
            </Card>

            <Card className="border-border p-8">
              <h3 className="mb-2 text-2xl font-bold">엔터프라이즈</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">맞춤</span>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">전용 AI 모델</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">무제한 자동 거래</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">전문가 지원</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm">API 접근</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                문의하기
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y border-border bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
            지금 바로 AI 예측을 시작하세요
          </h2>
          <p className="mb-8 text-pretty text-lg opacity-90">
            14일 무료 체험으로 InvestAI의 강력한 예측 기능을 경험해보세요
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <Link href="/signup">
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <svg
                    className="h-5 w-5 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <span className="text-xl font-semibold">InvestAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI 기반 자동 주식 투자 플랫폼
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">제품</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/#features">기능</Link>
                </li>
                <li>
                  <Link href="/#pricing">요금제</Link>
                </li>
                <li>
                  <Link href="/predict">AI 예측</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">회사</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about">회사 소개</Link>
                </li>
                <li>
                  <Link href="/blog">블로그</Link>
                </li>
                <li>
                  <Link href="/careers">채용</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help">고객 지원</Link>
                </li>
                <li>
                  <Link href="/docs">문서</Link>
                </li>
                <li>
                  <Link href="/contact">문의하기</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2025 InvestAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
