"use client";

import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Lock,
  CreditCard,
  History,
  Settings,
  Bell,
  Shield,
  LogOut,
  Edit2,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function MyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">마이페이지</h1>
          <p className="text-muted-foreground">계정 정보와 설정을 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="mb-6 flex flex-col items-center text-center">
                <Avatar className="mb-4 h-24 w-24">
                  <AvatarImage
                    src="/placeholder.svg?height=96&width=96"
                    alt="프로필"
                  />
                  <AvatarFallback className="bg-accent text-2xl text-accent-foreground">
                    홍길동
                  </AvatarFallback>
                </Avatar>
                <h3 className="mb-1 text-lg font-semibold">홍길동</h3>
                <p className="text-sm text-muted-foreground">
                  hong@example.com
                </p>
                <Badge className="mt-3 bg-accent/10 text-accent">
                  프로 플랜
                </Badge>
              </div>

              <div className="space-y-2 border-t border-border pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">가입일</span>
                  <span className="font-medium">2024.01.15</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">예측 횟수</span>
                  <span className="font-medium">127회</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">평균 정확도</span>
                  <span className="font-medium text-accent">89%</span>
                </div>
              </div>

              <Button variant="outline" className="mt-6 w-full" size="sm">
                <Edit2 className="mr-2 h-4 w-4" />
                프로필 편집
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">프로필</TabsTrigger>
                <TabsTrigger value="subscription">구독</TabsTrigger>
                <TabsTrigger value="settings">설정</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card className="p-6">
                  <h3 className="mb-6 text-lg font-semibold">개인 정보</h3>

                  <form className="space-y-4">
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

                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      변경사항 저장
                    </Button>
                  </form>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-6 text-lg font-semibold">비밀번호 변경</h3>

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
                </Card>
              </TabsContent>

              {/* Subscription Tab */}
              <TabsContent value="subscription" className="space-y-6">
                <Card className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">현재 플랜</h3>
                      <p className="text-sm text-muted-foreground">
                        다음 결제일: 2025.02.15
                      </p>
                    </div>
                    <Badge className="bg-accent/10 text-accent">
                      프로 플랜
                    </Badge>
                  </div>

                  <div className="mb-6 rounded-lg border border-border p-4">
                    <div className="mb-4 flex items-baseline justify-between">
                      <div>
                        <h4 className="text-2xl font-bold">₩79,000</h4>
                        <p className="text-sm text-muted-foreground">
                          월 구독료
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        플랜 변경
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
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
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      구독 일시정지
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-destructive hover:bg-destructive/10"
                    >
                      구독 취소
                    </Button>
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
                          <p className="text-sm text-muted-foreground">
                            만료: 12/26
                          </p>
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
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <Card className="p-6">
                  <div className="mb-6 flex items-center gap-2">
                    <History className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">최근 예측 내역</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        ticker: "AAPL",
                        name: "Apple Inc.",
                        date: "2025.01.15",
                        prediction: "+7.05%",
                        accuracy: "92%",
                      },
                      {
                        ticker: "TSLA",
                        name: "Tesla Inc.",
                        date: "2025.01.14",
                        prediction: "+3.21%",
                        accuracy: "88%",
                      },
                      {
                        ticker: "NVDA",
                        name: "NVIDIA Corp.",
                        date: "2025.01.13",
                        prediction: "+12.8%",
                        accuracy: "94%",
                      },
                      {
                        ticker: "005930",
                        name: "삼성전자",
                        date: "2025.01.12",
                        prediction: "+4.5%",
                        accuracy: "87%",
                      },
                      {
                        ticker: "MSFT",
                        name: "Microsoft Corp.",
                        date: "2025.01.11",
                        prediction: "+6.2%",
                        accuracy: "91%",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold">
                            {item.ticker.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.ticker} • {item.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-accent">
                            {item.prediction}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            정확도: {item.accuracy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="mt-4 w-full">
                    전체 내역 보기
                  </Button>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="p-6">
                  <div className="mb-6 flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">알림 설정</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">이메일 알림</p>
                        <p className="text-sm text-muted-foreground">
                          예측 완료 및 중요 업데이트
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        켜기
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">푸시 알림</p>
                        <p className="text-sm text-muted-foreground">
                          실시간 시장 변동 알림
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        끄기
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">주간 리포트</p>
                        <p className="text-sm text-muted-foreground">
                          매주 월요일 발송
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        켜기
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="mb-6 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">보안 설정</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">2단계 인증</p>
                        <p className="text-sm text-muted-foreground">
                          추가 보안 레이어
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        설정
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">로그인 알림</p>
                        <p className="text-sm text-muted-foreground">
                          새로운 기기 로그인 시
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        켜기
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">활성 세션</p>
                        <p className="text-sm text-muted-foreground">
                          2개 기기에서 로그인 중
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        관리
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="border-destructive/50 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-destructive" />
                    <h3 className="text-lg font-semibold text-destructive">
                      계정 관리
                    </h3>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이
                    작업은 되돌릴 수 없습니다.
                  </p>

                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    계정 삭제
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
