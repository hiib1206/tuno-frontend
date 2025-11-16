import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">포트폴리오</h1>
          <p className="text-muted-foreground">
            전체 투자 자산 및 배분 현황을 확인하세요
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Portfolio Overview */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="mb-4 text-xl font-semibold">자산 배분</h2>
                <div className="flex items-center gap-8">
                  <div className="flex h-48 w-48 items-center justify-center rounded-full bg-muted/30">
                    <img
                      src="/donut-chart-with-emerald-colors.jpg"
                      alt="자산 배분 차트"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-accent"></div>
                        <span className="text-sm font-medium">기술주</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">42%</p>
                        <p className="text-xs text-muted-foreground">
                          ₩17,997,000
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-chart-2"></div>
                        <span className="text-sm font-medium">금융</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">28%</p>
                        <p className="text-xs text-muted-foreground">
                          ₩11,998,000
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-chart-3"></div>
                        <span className="text-sm font-medium">헬스케어</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">18%</p>
                        <p className="text-xs text-muted-foreground">
                          ₩7,713,000
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-chart-4"></div>
                        <span className="text-sm font-medium">기타</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">12%</p>
                        <p className="text-xs text-muted-foreground">
                          ₩5,142,000
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Holdings List */}
            <Card className="mt-8 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">보유 종목</h2>
                <Button variant="outline" size="sm">
                  필터
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">종목</th>
                      <th className="pb-3 font-medium">보유량</th>
                      <th className="pb-3 font-medium">평균 단가</th>
                      <th className="pb-3 font-medium">현재가</th>
                      <th className="pb-3 font-medium">평가액</th>
                      <th className="pb-3 text-right font-medium">수익률</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-border/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold">
                            A
                          </div>
                          <div>
                            <p className="font-medium">Apple Inc.</p>
                            <p className="text-xs text-muted-foreground">
                              AAPL
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">45주</td>
                      <td className="py-4">$185.20</td>
                      <td className="py-4">$194.80</td>
                      <td className="py-4 font-medium">₩8,766,000</td>
                      <td className="py-4 text-right">
                        <Badge className="bg-accent/10 text-accent hover:bg-accent/20">
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                          +5.2%
                        </Badge>
                      </td>
                    </tr>

                    <tr className="border-b border-border/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold">
                            T
                          </div>
                          <div>
                            <p className="font-medium">Tesla Inc.</p>
                            <p className="text-xs text-muted-foreground">
                              TSLA
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">30주</td>
                      <td className="py-4">$245.50</td>
                      <td className="py-4">$241.10</td>
                      <td className="py-4 font-medium">₩7,233,000</td>
                      <td className="py-4 text-right">
                        <Badge
                          variant="outline"
                          className="border-destructive/50 text-destructive"
                        >
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                          -1.8%
                        </Badge>
                      </td>
                    </tr>

                    <tr className="border-b border-border/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold">
                            M
                          </div>
                          <div>
                            <p className="font-medium">Microsoft Corp.</p>
                            <p className="text-xs text-muted-foreground">
                              MSFT
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">25주</td>
                      <td className="py-4">$365.80</td>
                      <td className="py-4">$378.50</td>
                      <td className="py-4 font-medium">₩9,462,500</td>
                      <td className="py-4 text-right">
                        <Badge className="bg-accent/10 text-accent hover:bg-accent/20">
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                          +3.5%
                        </Badge>
                      </td>
                    </tr>

                    <tr className="border-b border-border/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold">
                            N
                          </div>
                          <div>
                            <p className="font-medium">NVIDIA Corp.</p>
                            <p className="text-xs text-muted-foreground">
                              NVDA
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">15주</td>
                      <td className="py-4">$485.30</td>
                      <td className="py-4">$524.80</td>
                      <td className="py-4 font-medium">₩7,872,000</td>
                      <td className="py-4 text-right">
                        <Badge className="bg-accent/10 text-accent hover:bg-accent/20">
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                          +8.1%
                        </Badge>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold">
                            G
                          </div>
                          <div>
                            <p className="font-medium">Alphabet Inc.</p>
                            <p className="text-xs text-muted-foreground">
                              GOOGL
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">35주</td>
                      <td className="py-4">$138.50</td>
                      <td className="py-4">$142.80</td>
                      <td className="py-4 font-medium">₩4,998,000</td>
                      <td className="py-4 text-right">
                        <Badge className="bg-accent/10 text-accent hover:bg-accent/20">
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                          +3.1%
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">포트폴리오 요약</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">총 투자금</p>
                  <p className="text-2xl font-bold">₩38,500,000</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">현재 평가액</p>
                  <p className="text-2xl font-bold">₩42,850,000</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">총 수익</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-accent">
                      +₩4,350,000
                    </p>
                    <Badge className="bg-accent/10 text-accent hover:bg-accent/20">
                      +11.3%
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">성과 지표</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">일간 수익률</span>
                  <div className="flex items-center gap-1 text-sm font-medium text-accent">
                    <TrendingUp className="h-4 w-4" />
                    <span>+2.8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">주간 수익률</span>
                  <div className="flex items-center gap-1 text-sm font-medium text-accent">
                    <TrendingUp className="h-4 w-4" />
                    <span>+5.4%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">월간 수익률</span>
                  <div className="flex items-center gap-1 text-sm font-medium text-accent">
                    <TrendingUp className="h-4 w-4" />
                    <span>+7.9%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">연간 수익률</span>
                  <div className="flex items-center gap-1 text-sm font-medium text-accent">
                    <TrendingUp className="h-4 w-4" />
                    <span>+18.2%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Risk Analysis */}
            <Card className="border-accent/20 bg-accent/5 p-6">
              <h3 className="mb-4 font-semibold">리스크 분석</h3>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">리스크 레벨</span>
                    <span className="font-medium">중간</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-3/5 bg-accent"></div>
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">다각화 점수</span>
                    <span className="font-medium">8.2/10</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-4/5 bg-accent"></div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  현재 포트폴리오는 적절히 다각화되어 있으며, 중간 수준의 리스크를
                  가지고 있습니다.
                </p>
              </div>
            </Card>

            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <PieChart className="mr-2 h-4 w-4" />
              리밸런싱 제안 보기
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
