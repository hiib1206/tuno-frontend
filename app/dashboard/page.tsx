import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">투자 현황을 한눈에 확인하세요</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 자산</p>
                <h3 className="mt-2 text-2xl font-bold">₩42,850,000</h3>
                <div className="mt-2 flex items-center gap-1 text-sm text-accent">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">일일 수익</p>
                <h3 className="mt-2 text-2xl font-bold">+₩325,000</h3>
                <div className="mt-2 flex items-center gap-1 text-sm text-accent">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+2.8%</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 투자</p>
                <h3 className="mt-2 text-2xl font-bold">24개</h3>
                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>실시간 모니터링</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Activity className="h-6 w-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">평균 수익률</p>
                <h3 className="mt-2 text-2xl font-bold">18.2%</h3>
                <div className="mt-2 flex items-center gap-1 text-sm text-accent">
                  <TrendingUp className="h-4 w-4" />
                  <span>연간 기준</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">포트폴리오 성과</h2>
                  <p className="text-sm text-muted-foreground">최근 30일</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    1주
                  </Button>
                  <Button size="sm" variant="outline">
                    1개월
                  </Button>
                  <Button size="sm" className="bg-primary">
                    3개월
                  </Button>
                  <Button size="sm" variant="outline">
                    1년
                  </Button>
                </div>
              </div>
              <div className="h-80 rounded-lg bg-muted/30">
                <img
                  src="/financial-line-chart-showing-growth-trend-in-emera.jpg"
                  alt="포트폴리오 차트"
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>
            </Card>

            {/* AI Insights */}
            <Card className="mt-8 border-accent/20 bg-accent/5 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                  <Activity className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="font-semibold">AI 인사이트</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                  <div>
                    <p className="font-medium">기술주 섹터 강세</p>
                    <p className="text-sm text-muted-foreground">
                      AI 분석 결과, 향후 2주간 기술주 섹터가 강세를 보일 것으로
                      예상됩니다
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                  <div>
                    <p className="font-medium">리밸런싱 권장</p>
                    <p className="text-sm text-muted-foreground">
                      포트폴리오 최적화를 위해 3개 종목의 비중 조정이 권장됩니다
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <DollarSign className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                  <div>
                    <p className="font-medium">신규 투자 기회</p>
                    <p className="text-sm text-muted-foreground">
                      AI가 2개의 저평가 종목을 발견했습니다
                    </p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Top Holdings */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">주요 보유 종목</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold">
                      A
                    </div>
                    <div>
                      <p className="font-medium">Apple Inc.</p>
                      <p className="text-xs text-muted-foreground">AAPL</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩8,520,000</p>
                    <div className="flex items-center gap-1 text-xs text-accent">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>+5.2%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold">
                      T
                    </div>
                    <div>
                      <p className="font-medium">Tesla Inc.</p>
                      <p className="text-xs text-muted-foreground">TSLA</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩7,340,000</p>
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <ArrowDownRight className="h-3 w-3" />
                      <span>-1.8%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold">
                      M
                    </div>
                    <div>
                      <p className="font-medium">Microsoft Corp.</p>
                      <p className="text-xs text-muted-foreground">MSFT</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩6,890,000</p>
                    <div className="flex items-center gap-1 text-xs text-accent">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>+3.4%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold">
                      N
                    </div>
                    <div>
                      <p className="font-medium">NVIDIA Corp.</p>
                      <p className="text-xs text-muted-foreground">NVDA</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩5,620,000</p>
                    <div className="flex items-center gap-1 text-xs text-accent">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>+8.1%</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="mt-4 w-full" variant="outline">
                전체 보기
              </Button>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">최근 활동</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">매수 완료</p>
                    <p className="text-xs text-muted-foreground">
                      AAPL 10주 매수
                    </p>
                    <p className="text-xs text-muted-foreground">2시간 전</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <TrendingDown className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">매도 완료</p>
                    <p className="text-xs text-muted-foreground">
                      GOOGL 5주 매도
                    </p>
                    <p className="text-xs text-muted-foreground">5시간 전</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Activity className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">리밸런싱</p>
                    <p className="text-xs text-muted-foreground">
                      포트폴리오 자동 조정
                    </p>
                    <p className="text-xs text-muted-foreground">1일 전</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
