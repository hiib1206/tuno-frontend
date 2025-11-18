"use client";

import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { User, Mail, Phone, Lock, CreditCard, History, Settings, Bell, Shield, LogOut, TrendingUp, Star, BarChart3, Calendar } from 'lucide-react';

type MenuItem = "dashboard" | "history" | "favorites" | "profile" | "notifications" | "subscription" | "security";

export default function MyPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>("dashboard");

  const menuItems = [
    { id: "dashboard" as MenuItem, label: "대시보드", icon: BarChart3 },
    { id: "history" as MenuItem, label: "예측 내역", icon: History },
    { id: "favorites" as MenuItem, label: "즐겨찾기", icon: Star },
    { id: "profile" as MenuItem, label: "프로필 설정", icon: User },
    { id: "notifications" as MenuItem, label: "알림 설정", icon: Bell },
    { id: "subscription" as MenuItem, label: "구독 관리", icon: CreditCard },
    { id: "security" as MenuItem, label: "보안 설정", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">마이페이지</h1>
          <p className="text-muted-foreground">계정 정보와 설정을 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              {/* User Profile Section */}
              <div className="mb-6 flex flex-col items-center border-b border-border pb-6 text-center">
                <Avatar className="mb-3 h-20 w-20">
                  <AvatarImage
                    src="/placeholder.svg?height=80&width=80"
                    alt="프로필"
                  />
                  <AvatarFallback className="bg-accent text-xl text-accent-foreground">
                    홍길동
                  </AvatarFallback>
                </Avatar>
                <h3 className="mb-1 font-semibold">홍길동</h3>
                <p className="mb-2 text-xs text-muted-foreground">
                  hong@example.com
                </p>
                <Badge className="bg-accent/10 text-accent text-xs">
                  프로 플랜
                </Badge>
              </div>

              {/* Menu Items */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        activeMenu === item.id
                          ? "bg-accent/10 text-accent"
                          : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <Button
                variant="outline"
                className="mt-6 w-full text-destructive hover:bg-destructive/10"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4">
            {/* Dashboard */}
            {activeMenu === "dashboard" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="mb-6 text-2xl font-bold">대시보드</h2>

                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">총 예측 횟수</p>
                          <p className="mt-1 text-2xl font-bold">127</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                          <TrendingUp className="h-6 w-6 text-accent" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">평균 정확도</p>
                          <p className="mt-1 text-2xl font-bold text-accent">89%</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                          <BarChart3 className="h-6 w-6 text-accent" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">즐겨찾기</p>
                          <p className="mt-1 text-2xl font-bold">8</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                          <Star className="h-6 w-6 text-accent" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">최근 활동</h3>
                    <div className="space-y-3">
                      {[
                        { action: "AI 예측 완료", detail: "AAPL - Apple Inc.", time: "10분 전" },
                        { action: "즐겨찾기 추가", detail: "TSLA - Tesla Inc.", time: "2시간 전" },
                        { action: "AI 예측 완료", detail: "005930 - 삼성전자", time: "5시간 전" },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.detail}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* History */}
            {activeMenu === "history" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">예측 내역</h2>
                    <Button variant="outline" size="sm">
                      필터
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        ticker: "AAPL",
                        name: "Apple Inc.",
                        date: "2025.01.15",
                        period: "30일",
                        prediction: "+7.05%",
                        accuracy: "92%",
                        status: "완료",
                      },
                      {
                        ticker: "TSLA",
                        name: "Tesla Inc.",
                        date: "2025.01.14",
                        period: "60일",
                        prediction: "+3.21%",
                        accuracy: "88%",
                        status: "완료",
                      },
                      {
                        ticker: "NVDA",
                        name: "NVIDIA Corp.",
                        date: "2025.01.13",
                        period: "90일",
                        prediction: "+12.8%",
                        accuracy: "94%",
                        status: "완료",
                      },
                      {
                        ticker: "005930",
                        name: "삼성전자",
                        date: "2025.01.12",
                        period: "30일",
                        prediction: "+4.5%",
                        accuracy: "87%",
                        status: "완료",
                      },
                      {
                        ticker: "MSFT",
                        name: "Microsoft Corp.",
                        date: "2025.01.11",
                        period: "60일",
                        prediction: "+6.2%",
                        accuracy: "91%",
                        status: "완료",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 font-semibold text-accent">
                            {item.ticker.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.ticker} • {item.date} • {item.period}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-accent">{item.prediction}</p>
                          <p className="text-sm text-muted-foreground">
                            정확도: {item.accuracy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="mt-6 w-full">
                    더 보기
                  </Button>
                </Card>
              </div>
            )}

            {/* Favorites */}
            {activeMenu === "favorites" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">즐겨찾기</h2>
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      종목 추가
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      { ticker: "AAPL", name: "Apple Inc.", price: "$182.52", change: "+2.4%" },
                      { ticker: "TSLA", name: "Tesla Inc.", price: "$242.84", change: "+1.8%" },
                      { ticker: "NVDA", name: "NVIDIA Corp.", price: "$875.28", change: "+5.2%" },
                      { ticker: "005930", name: "삼성전자", price: "₩71,200", change: "+1.1%" },
                      { ticker: "MSFT", name: "Microsoft Corp.", price: "$420.55", change: "+0.8%" },
                      { ticker: "GOOGL", name: "Alphabet Inc.", price: "$162.28", change: "+1.5%" },
                      { ticker: "AMZN", name: "Amazon.com", price: "$180.75", change: "+2.1%" },
                      { ticker: "035420", name: "NAVER", price: "₩215,500", change: "+0.5%" },
                    ].map((stock, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-bold text-accent">
                            {stock.ticker.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-medium">{stock.name}</p>
                            <p className="text-sm text-muted-foreground">{stock.ticker}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{stock.price}</p>
                          <p className="text-sm font-medium text-accent">{stock.change}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Profile Settings */}
            {activeMenu === "profile" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="mb-6 text-2xl font-bold">프로필 설정</h2>

                  <div className="mb-8 flex items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt="프로필" />
                      <AvatarFallback className="bg-accent text-2xl text-accent-foreground">
                        홍길동
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        사진 변경
                      </Button>
                      <p className="mt-2 text-xs text-muted-foreground">
                        JPG, PNG 형식 (최대 2MB)
                      </p>
                    </div>
                  </div>

                  <form className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">이름</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            defaultValue="홍길동"
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">전화번호</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            defaultValue="010-1234-5678"
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">이메일</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          defaultValue="hong@example.com"
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="joinDate">가입일</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="joinDate"
                          defaultValue="2024.01.15"
                          disabled
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      변경사항 저장
                    </Button>
                  </form>
                </Card>
              </div>
            )}

            {/* Notification Settings */}
            {activeMenu === "notifications" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="mb-6 text-2xl font-bold">알림 설정</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 font-semibold">이메일 알림</h3>
                      <div className="space-y-3">
                        {[
                          { label: "예측 완료 알림", description: "AI 분석이 완료되면 알림" },
                          { label: "주간 리포트", description: "매주 월요일 요약 리포트 발송" },
                          { label: "마케팅 정보", description: "새로운 기능 및 프로모션" },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-border p-4"
                          >
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              켜기
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4 font-semibold">푸시 알림</h3>
                      <div className="space-y-3">
                        {[
                          { label: "실시간 시장 알림", description: "즐겨찾기 종목의 급등/급락" },
                          { label: "예측 알림", description: "예측 결과 및 인사이트" },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-border p-4"
                          >
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              끄기
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Subscription Management */}
            {activeMenu === "subscription" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="mb-6 text-2xl font-bold">구독 관리</h2>

                  <div className="mb-6 rounded-lg border-2 border-accent/20 bg-accent/5 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">프로 플랜</h3>
                        <p className="text-sm text-muted-foreground">
                          다음 결제일: 2025.02.15
                        </p>
                      </div>
                      <Badge className="bg-accent/10 text-accent">활성</Badge>
                    </div>

                    <div className="mb-6">
                      <p className="text-3xl font-bold">₩79,000</p>
                      <p className="text-sm text-muted-foreground">월 구독료</p>
                    </div>

                    <div className="mb-6 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <span>무제한 AI 예측</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <span>상세 분석 리포트</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <span>실시간 알림</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <span>우선 고객 지원</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        플랜 변경
                      </Button>
                      <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10">
                        구독 취소
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">결제 수단</h3>
                  </div>

                  <div className="mb-4 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-accent/10">
                          <CreditCard className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 1234</p>
                          <p className="text-sm text-muted-foreground">만료: 12/26</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        변경
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    새 결제 수단 추가
                  </Button>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">결제 내역</h3>
                  <div className="space-y-3">
                    {[
                      { date: "2025.01.15", amount: "₩79,000", status: "완료" },
                      { date: "2024.12.15", amount: "₩79,000", status: "완료" },
                      { date: "2024.11.15", amount: "₩79,000", status: "완료" },
                    ].map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <p className="font-medium">{payment.amount}</p>
                          <p className="text-sm text-muted-foreground">{payment.date}</p>
                        </div>
                        <Badge variant="outline" className="text-accent">
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Security Settings */}
            {activeMenu === "security" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="mb-6 text-2xl font-bold">보안 설정</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 font-semibold">비밀번호 변경</h3>
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">현재 비밀번호</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="currentPassword"
                              type="password"
                              placeholder="••••••••"
                              className="pl-9"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">새 비밀번호</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="newPassword"
                              type="password"
                              placeholder="••••••••"
                              className="pl-9"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="••••••••"
                              className="pl-9"
                            />
                          </div>
                        </div>

                        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                          비밀번호 변경
                        </Button>
                      </form>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="mb-4 font-semibold">2단계 인증</h3>
                      <div className="space-y-3">
                        {[
                          { label: "2단계 인증 활성화", description: "추가 보안 레이어로 계정 보호" },
                          { label: "로그인 알림", description: "새로운 기기 로그인 시 이메일 알림" },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-border p-4"
                          >
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              설정
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="mb-4 font-semibold">활성 세션</h3>
                      <div className="space-y-3">
                        {[
                          { device: "Windows PC", location: "서울, 대한민국", time: "현재 세션" },
                          { device: "iPhone 15", location: "서울, 대한민국", time: "2시간 전" },
                        ].map((session, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-border p-4"
                          >
                            <div>
                              <p className="font-medium">{session.device}</p>
                              <p className="text-sm text-muted-foreground">
                                {session.location} • {session.time}
                              </p>
                            </div>
                            {index !== 0 && (
                              <Button variant="outline" size="sm" className="text-destructive">
                                종료
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border-destructive/50 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-destructive" />
                    <h3 className="text-lg font-semibold text-destructive">위험 구역</h3>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                  </p>

                  <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                    계정 삭제
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
