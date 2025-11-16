"use client"

import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Brain, TrendingUp, TrendingDown, Calendar, Search, Sparkles, LineChart, AlertCircle } from 'lucide-react'

export default function PredictPage() {
  const [ticker, setTicker] = useState("")
  const [period, setPeriod] = useState("")
  const [predicting, setPredicting] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handlePredict = () => {
    setPredicting(true)
    // Simulate AI prediction
    setTimeout(() => {
      setPredicting(false)
      setShowResults(true)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">AI 주식 예측</h1>
          <p className="text-muted-foreground">
            종목과 기간을 입력하면 AI가 과거 데이터를 분석하여 미래를 예측합니다
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
                <h3 className="font-semibold">AI 예측 엔진</h3>
                <p className="text-sm text-muted-foreground">
                  딥러닝 기반 시계열 분석 모델 활성화
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent"></span>
              </div>
              <span className="text-sm font-medium">준비 완료</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="mb-6 text-xl font-semibold">예측 설정</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ticker">종목 코드</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ticker"
                      placeholder="예: AAPL, TSLA, 005930"
                      className="pl-9"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    미국 주식은 티커, 한국 주식은 종목 코드를 입력하세요
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">분석 기간</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger id="period">
                      <SelectValue placeholder="기간 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1개월</SelectItem>
                      <SelectItem value="3m">3개월</SelectItem>
                      <SelectItem value="6m">6개월</SelectItem>
                      <SelectItem value="1y">1년</SelectItem>
                      <SelectItem value="3y">3년</SelectItem>
                      <SelectItem value="5y">5년</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    AI가 이 기간의 데이터를 학습합니다
                  </p>
                </div>

                <Button 
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={handlePredict}
                  disabled={!ticker || !period || predicting}
                >
                  {predicting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent"></div>
                      AI 분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      예측 시작
                    </>
                  )}
                </Button>

                {/* Popular Stocks */}
                <div className="border-t border-border pt-6">
                  <p className="mb-3 text-sm font-medium">인기 종목</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setTicker("AAPL")}
                    >
                      AAPL
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setTicker("TSLA")}
                    >
                      TSLA
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setTicker("NVDA")}
                    >
                      NVDA
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setTicker("005930")}
                    >
                      삼성전자
                    </Button>
                  </div>
                </div>

                {/* Info Box */}
                <Card className="border-accent/20 bg-accent/5 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      AI 예측은 참고용이며, 실제 투자 결정은 본인의 판단과 책임하에 이루어져야 합니다.
                    </p>
                  </div>
                </Card>
              </div>
            </Card>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2">
            {!showResults ? (
              <Card className="flex h-full min-h-[600px] flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                  <LineChart className="h-10 w-10 text-accent" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  분석을 시작하세요
                </h3>
                <p className="text-muted-foreground">
                  종목 코드와 기간을 선택하고 예측 시작 버튼을 클릭하세요
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Prediction Summary */}
                <Card className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Apple Inc. (AAPL)</h2>
                      <p className="text-sm text-muted-foreground">분석 기간: 최근 1년</p>
                    </div>
                    <Badge className="bg-accent/10 text-accent">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI 생성
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-border p-4">
                      <p className="mb-1 text-sm text-muted-foreground">현재 가격</p>
                      <p className="text-2xl font-bold">$185.43</p>
                    </div>
                    <div className="rounded-lg border border-accent bg-accent/5 p-4">
                      <p className="mb-1 text-sm text-muted-foreground">예상 가격 (30일 후)</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">$198.50</p>
                        <TrendingUp className="h-5 w-5 text-accent" />
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="mb-1 text-sm text-muted-foreground">예상 수익률</p>
                      <p className="text-2xl font-bold text-accent">+7.05%</p>
                    </div>
                  </div>
                </Card>

                {/* Prediction Chart */}
                <Card className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">예측 차트</h3>
                  <div className="h-80 rounded-lg bg-muted/30">
                    <img
                      src="/financial-line-chart-showing-growth-trend-in-emera.jpg"
                      alt="예측 차트"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    파란색 선은 과거 실제 데이터, 녹색 선은 AI 예측 데이터입니다
                  </p>
                </Card>

                {/* AI Analysis */}
                <Card className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">AI 분석 인사이트</h3>
                  
                  <div className="space-y-4">
                    <div className="rounded-lg border-l-4 border-accent bg-accent/5 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold">긍정적 신호</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"></span>
                          <span>
                            과거 1년간 안정적인 상승 추세를 보이고 있습니다
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"></span>
                          <span>
                            거래량이 지속적으로 증가하고 있어 시장 관심이 높습니다
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"></span>
                          <span>
                            계절적 패턴 분석 결과 향후 30일간 상승 가능성이 높습니다
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-lg border-l-4 border-muted bg-muted/30 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-semibold">주의 사항</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground"></span>
                          <span>
                            단기 변동성이 있을 수 있으며, 외부 시장 요인에 영향을 받을 수 있습니다
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground"></span>
                          <span>
                            AI 예측은 과거 데이터 기반이며 미래를 보장하지 않습니다
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Confidence Score */}
                <Card className="border-accent/20 bg-accent/5 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="mb-1 font-semibold">AI 예측 신뢰도</h3>
                      <p className="text-sm text-muted-foreground">
                        과거 데이터 분석 및 패턴 인식 기반
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-accent">89%</div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/50">
                    <div className="h-full w-[89%] bg-accent"></div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => setShowResults(false)}
                  >
                    새로운 예측
                  </Button>
                  <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                    상세 리포트 다운로드
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
