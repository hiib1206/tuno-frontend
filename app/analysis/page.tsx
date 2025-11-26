"use client";

import { AnalysisForm } from "@/components/analysis/AnalysisForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserMenu } from "@/components/UserMenu";
import { useAuthStore } from "@/stores/authStore";
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Home,
  Menu,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AnalysisPage() {
  const { user } = useAuthStore();
  // 사이드바 열고 닫기
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // 분석 내역 열고 닫기
  const [historyOpen, setHistoryOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [period, setPeriod] = useState("");
  const [aiModel, setAiModel] = useState("gpt-4");
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Mock analysis history
  const analysisHistory = [
    { ticker: "AAPL", date: "2024-01-15", model: "GPT-4", result: "+7.2%" },
    { ticker: "TSLA", date: "2024-01-14", model: "Claude", result: "-2.3%" },
    { ticker: "삼성전자", date: "2024-01-13", model: "GPT-4", result: "+4.5%" },
    { ticker: "NVDA", date: "2024-01-12", model: "Gemini", result: "+12.8%" },
    { ticker: "AAPL", date: "2024-01-15", model: "GPT-4", result: "+7.2%" },
    { ticker: "AAPL", date: "2024-01-15", model: "GPT-4", result: "+7.2%" },
    { ticker: "AAPL", date: "2024-01-15", model: "GPT-4", result: "+7.2%" },
    { ticker: "AAPL", date: "2024-01-15", model: "GPT-4", result: "+7.2%" },
    { ticker: "AAPL", date: "2024-01-15", model: "GPT-4", result: "+7.2%" },
    { ticker: "AAPL", date: "2024-01-15", model: "GPT-4", result: "+7.2%" },
    { ticker: "AAPL", date: "2024-01-15", model: "GPT-4", result: "+7.2%" },
    { ticker: "AAPL", date: "2024-01-15", model: "GPT-4", result: "+7.2%" },
    { ticker: "삼성전자", date: "2024-01-13", model: "GPT-4", result: "+4.5%" },
  ];

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-70" : "w-14"
        } transition-all duration-300 border-r border-border overflow-hidden flex-shrink-0 relative bg-accent-light`}
      >
        {/* Toggle Button - always visible */}
        <Button
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-4 h-9 w-9 z-10 group ${
            sidebarOpen ? "right-4" : "right-3"
          }`}
        >
          <Menu className="size-5 group-hover:text-accent" />
        </Button>
        <div
          className={`h-full flex flex-col px-3 overflow-y-auto transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col">
            <div className="sticky top-0 pt-4 flex flex-col gap-1">
              <Link
                href="/"
                className="flex items-center gap-2 p-2 w-fit transition-opacity hover:bg-muted rounded-lg group mb-5"
              >
                <Home className="h-5 w-5 text-primary group-hover:text-accent" />
              </Link>

              <Button
                onClick={() => {
                  setShowResults(false);
                  setTicker("");
                  setPeriod("");
                }}
                variant="ghost"
                className="flex items-center w-full justify-start !px-2 group hover:bg-muted/50"
              >
                <BarChart3 className="size-5 group-hover:text-accent" />
                <h2 className="text-base font-medium">새 분석</h2>
              </Button>
              <Button
                onClick={() => setHistoryOpen(!historyOpen)}
                variant="ghost"
                className="flex items-center w-full justify-start !px-2 group hover:bg-muted/50"
              >
                <Clock className="size-5 group-hover:text-accent" />
                <h2 className="text-base font-medium">분석 내역</h2>
                {historyOpen ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </Button>
            </div>

            <div
              className={`space-y-1 overflow-hidden transition-all duration-300 ${
                historyOpen ? "opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {analysisHistory.map((item, index) => (
                <Card
                  key={index}
                  className="p-2 hover:bg-muted/50 cursor-pointer transition-colors border-none shadow-none bg-transparent"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-md">{item.ticker}</span>
                    <span className="text-muted-foreground text-sm font-medium">
                      {item.date}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden dark:bg-secondary/50">
        <div
          className={`h-17 px-6 flex items-center justify-between flex-shrink-0 ${
            showResults ? "border-b border-border" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="h-9 text-base border-none shadow-none overflow-hidden">
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

          {/* User Profile Dropdown or Login Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <UserMenu />
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">로그인</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showResults ? (
            <AnalysisForm
              ticker={ticker}
              period={period}
              aiModel={aiModel}
              analyzing={analyzing}
              onTickerChange={setTicker}
              onPeriodChange={setPeriod}
              onAnalyze={handleAnalyze}
            />
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
                  <p className="text-sm text-muted-foreground mb-1">
                    현재 가격
                  </p>
                  <p className="text-3xl font-bold">$185.43</p>
                </Card>
                <Card className="p-6 border-primary bg-primary/5">
                  <p className="text-sm text-muted-foreground mb-1">
                    예측 가격 (30일)
                  </p>
                  <p className="text-3xl font-bold text-primary">$198.50</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    예상 수익률
                  </p>
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
                      <p className="text-sm">
                        과거 1년간 안정적인 상승 추세를 보이고 있습니다
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <p className="text-sm">
                        거래량이 지속적으로 증가하고 있어 시장 관심이 높습니다
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <p className="text-sm">
                        계절적 패턴 분석 결과 향후 30일간 상승 가능성이 높습니다
                      </p>
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
                      <p className="text-sm">
                        단기 변동성이 있을 수 있으며, 외부 시장 요인에 영향을
                        받을 수 있습니다
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <p className="text-sm">
                        AI 예측은 과거 데이터 기반이며 미래를 보장하지 않습니다
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <p className="text-sm">
                        투자 결정 시 다양한 정보를 종합적으로 고려하시기
                        바랍니다
                      </p>
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
                  이 예측은 높은 신뢰도를 가지고 있습니다. 과거 데이터 패턴과
                  시장 동향을 종합적으로 분석한 결과입니다.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
