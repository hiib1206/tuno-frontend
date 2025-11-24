"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Clock,
  TrendingUp,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Brain,
  User,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react"
import { useState } from "react"

export default function AnalysisPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [ticker, setTicker] = useState("")
  const [period, setPeriod] = useState("")
  const [aiModel, setAiModel] = useState("gpt-4")
  const [analyzing, setAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Mock analysis history
  const analysisHistory = [
    { ticker: "AAPL", date: "2024-01-15", model: "GPT-4", result: "+7.2%" },
    { ticker: "TSLA", date: "2024-01-14", model: "Claude", result: "-2.3%" },
    { ticker: "삼성전자", date: "2024-01-13", model: "GPT-4", result: "+4.5%" },
    { ticker: "NVDA", date: "2024-01-12", model: "Gemini", result: "+12.8%" },
  ]

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setShowResults(true)
    }, 2000)
  }

  return (
    <div className="flex h-screen bg-background">
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 border-r border-border bg-card overflow-hidden flex-shrink-0`}
      >
        <div className="h-full flex flex-col p-6">
          {/* Stock Search Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">종목 분석</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="ticker" className="text-sm mb-2 block">
                  종목 코드
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ticker"
                    placeholder="AAPL, 삼성전자, 005930..."
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="period" className="text-sm mb-2 block">
                  분석 기간
                </Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger id="period">
                    <SelectValue placeholder="기간을 선택하세요" />
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
              </div>

              <Button className="w-full" size="lg" onClick={handleAnalyze} disabled={!ticker || !period || analyzing}>
                {analyzing ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    AI 분석 시작
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Analysis History */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">분석 내역</h2>
            </div>

            <div className="space-y-2 overflow-y-auto h-[calc(100%-2rem)]">
              {analysisHistory.map((item, index) => (
                <Card key={index} className="p-3 hover:bg-accent cursor-pointer transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-sm">{item.ticker}</span>
                    <span
                      className={`text-xs font-medium ${
                        item.result.startsWith("+") ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {item.result}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.date}</span>
                    <span className="text-primary">{item.model}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-primary" />
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">AI 모델:</Label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
                    <SelectItem value="claude">Claude 3 Opus</SelectItem>
                    <SelectItem value="gemini">Gemini Pro</SelectItem>
                    <SelectItem value="llama">LLaMA 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>김</AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">김투자</p>
                  <p className="text-xs text-muted-foreground">Premium</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                마이페이지
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                설정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showResults ? (
            // Empty State
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">AI 종목 분석 시작</h3>
                <p className="text-muted-foreground mb-6">
                  좌측 사이드바에서 종목과 분석 기간을 선택하면
                  <br />
                  AI가 과거 데이터를 분석하여 미래를 예측합니다
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>현재 모델: {aiModel.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ) : (
            // Analysis Results
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header with Stock Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Apple Inc. (AAPL)</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>분석 기간: 1년</span>
                    <span>•</span>
                    <span>AI 모델: {aiModel.toUpperCase()}</span>
                    <span>•</span>
                    <span>분석 시간: 2024-01-15 14:32</span>
                  </div>
                </div>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  리포트 다운로드
                </Button>
              </div>

              {/* Price Prediction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">현재 가격</p>
                  <p className="text-3xl font-bold">$185.43</p>
                </Card>
                <Card className="p-6 border-primary bg-primary/5">
                  <p className="text-sm text-muted-foreground mb-1">예측 가격 (30일)</p>
                  <p className="text-3xl font-bold text-primary">$198.50</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">예상 수익률</p>
                  <p className="text-3xl font-bold text-green-500">+7.05%</p>
                </Card>
              </div>

              {/* Chart Placeholder */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">가격 예측 차트</h3>
                <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-2" />
                    <p>차트 영역</p>
                  </div>
                </div>
              </Card>

              {/* AI Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">긍정적 요인</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <p className="text-sm">과거 1년간 안정적인 상승 추세를 보이고 있습니다</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <p className="text-sm">거래량이 지속적으로 증가하고 있어 시장 관심이 높습니다</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <p className="text-sm">계절적 패턴 분석 결과 향후 30일간 상승 가능성이 높습니다</p>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">주의사항</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <p className="text-sm">단기 변동성이 있을 수 있으며, 외부 시장 요인에 영향을 받을 수 있습니다</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <p className="text-sm">AI 예측은 과거 데이터 기반이며 미래를 보장하지 않습니다</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <p className="text-sm">투자 결정 시 다양한 정보를 종합적으로 고려하시기 바랍니다</p>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Confidence Score */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">AI 신뢰도 점수</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 via-green-500 to-emerald-500"
                        style={{ width: "89%" }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-bold">89%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  이 예측은 높은 신뢰도를 가지고 있습니다. 과거 데이터 패턴과 시장 동향을 종합적으로 분석한 결과입니다.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
