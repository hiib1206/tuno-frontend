import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Sparkles, Target, Clock, ArrowRight } from 'lucide-react'

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">AI 투자 분석</h1>
          <p className="text-muted-foreground">
            실시간 AI 분석으로 최적의 투자 결정을 내리세요
          </p>
        </div>

        {/* AI Status Banner */}
        <Card className="mb-8 border-accent/20 bg-accent/5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <Brain className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">AI 분석 엔진 활성화</h3>
                <p className="text-sm text-muted-foreground">
                  마지막 업데이트: 5분 전 • 다음 분석: 55분 후
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent"></span>
              </div>
              <span className="text-sm font-medium">실시간 모니터링</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Market Outlook */}
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">시장 전망</h2>
                <Badge className="bg-accent/10 text-accent">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI 생성
                </Badge>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold">긍정적 신호</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"></span>
                      <span>
                        기술주 섹터의 강한 모멘텀이 지속되고 있으며, AI 관련 기업들의
                        실적이 예상을 상회하고 있습니다
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"></span>
                      <span>
                        연준의 금리 인하 기대감으로 인해 성장주에 대한 투자 심리가
                        개선되고 있습니다
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"></span>
                      <span>
                        기업들의 2분기 실적 발표가 전반적으로 긍정적이며, 가이던스도
                        양호한 편입니다
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h3 className="font-semibold">주의 신호</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive"></span>
                      <span>
                        일부 밸류에이션이 과열 구간에 진입했으며, 단기 조정 가능성이
                        있습니다
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive"></span>
                      <span>
                        지정학적 리스크와 글로벌 경제 불확실성이 여전히 잠재적
                        위험요인으로 작용하고 있습니다
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* AI Recommendations */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">AI 투자 추천</h2>

              <div className="space-y-4">
                <div className="rounded-lg border-l-4 border-accent bg-accent/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-sm font-semibold">
                        N
                      </div>
                      <div>
                        <p className="font-semibold">NVIDIA Corporation</p>
                        <p className="text-sm text-muted-foreground">NVDA</p>
                      </div>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">
                      강력 매수
                    </Badge>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    AI 칩 수요 급증과 데이터센터 투자 확대로 향후 12개월간 30% 이상의
                    상승 가능성이 있습니다. 현재 가격은 장기 투자 관점에서 매력적인
                    진입점입니다.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">목표가: $650</span>
                    <span className="text-muted-foreground">
                      신뢰도: 92%
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border-l-4 border-accent bg-accent/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-sm font-semibold">
                        A
                      </div>
                      <div>
                        <p className="font-semibold">Apple Inc.</p>
                        <p className="text-sm text-muted-foreground">AAPL</p>
                      </div>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">
                      매수
                    </Badge>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    신제품 출시 사이클과 서비스 부문의 안정적 성장이 예상됩니다.
                    배당수익률도 매력적이며, 포트폴리오 안정성 강화에 기여할 수
                    있습니다.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">목표가: $220</span>
                    <span className="text-muted-foreground">
                      신뢰도: 87%
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border-l-4 border-muted bg-muted/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                        T
                      </div>
                      <div>
                        <p className="font-semibold">Tesla Inc.</p>
                        <p className="text-sm text-muted-foreground">TSLA</p>
                      </div>
                    </div>
                    <Badge variant="outline">보유</Badge>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    현재 밸류에이션이 높은 편이나, 장기 성장 잠재력은 여전히 유효합니다.
                    현재 포지션 유지를 권장하며, 추가 매수는 조정 시 고려하세요.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">목표가: $255</span>
                    <span className="text-muted-foreground">
                      신뢰도: 78%
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Sector Analysis */}
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold">섹터별 분석</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">기술 (Technology)</p>
                      <p className="text-sm text-muted-foreground">
                        AI 및 클라우드 성장세 지속
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-accent/10 text-accent">
                      강세
                    </Badge>
                    <p className="mt-1 text-sm text-muted-foreground">+12.4%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">헬스케어 (Healthcare)</p>
                      <p className="text-sm text-muted-foreground">
                        바이오텍 회복세
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-accent/10 text-accent">
                      긍정
                    </Badge>
                    <p className="mt-1 text-sm text-muted-foreground">+8.7%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">금융 (Finance)</p>
                      <p className="text-sm text-muted-foreground">
                        금리 변동성 대응
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">중립</Badge>
                    <p className="mt-1 text-sm text-muted-foreground">+3.2%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                      <TrendingDown className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold">에너지 (Energy)</p>
                      <p className="text-sm text-muted-foreground">
                        유가 하락 압력
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className="border-destructive/50 text-destructive"
                    >
                      약세
                    </Badge>
                    <p className="mt-1 text-sm text-muted-foreground">-2.8%</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">빠른 실행</h3>
              <div className="space-y-3">
                <Button className="w-full justify-between bg-accent text-accent-foreground hover:bg-accent/90">
                  포트폴리오 최적화
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  리밸런싱 제안
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  리스크 분석
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Analysis Schedule */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">분석 일정</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">실시간 모니터링</p>
                    <p className="text-xs text-muted-foreground">
                      24/7 시장 데이터 추적
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Target className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">매시간 분석</p>
                    <p className="text-xs text-muted-foreground">
                      포트폴리오 최적화 확인
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Brain className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">일일 리포트</p>
                    <p className="text-xs text-muted-foreground">
                      매일 오전 9시 발송
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Confidence */}
            <Card className="border-accent/20 bg-accent/5 p-6">
              <h3 className="mb-4 font-semibold">AI 신뢰도</h3>
              <div className="mb-2 text-center">
                <div className="mb-2 text-4xl font-bold text-accent">94%</div>
                <p className="text-sm text-muted-foreground">
                  현재 시장 예측 정확도
                </p>
              </div>
              <div className="mt-4 rounded-lg bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">
                  최근 30일간의 투자 추천 중 94%가 목표가를 달성했습니다. AI 모델은
                  지속적으로 학습하며 정확도를 개선하고 있습니다.
                </p>
              </div>
            </Card>

            {/* Market Sentiment */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">시장 심리</h3>
              <div className="space-y-3">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">투자자 심리</span>
                    <span className="font-medium text-accent">낙관적</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-3/4 bg-accent"></div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">공포/탐욕 지수</span>
                    <span className="font-medium">72</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[72%] bg-accent"></div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  현재 시장은 탐욕 구간에 진입했으나, 아직 과열 수준은 아닙니다.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
