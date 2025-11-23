"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp } from "lucide-react";

export function SubscriptionManagement() {
  return (
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
            <Button
              variant="outline"
              className="flex-1 text-destructive hover:bg-destructive/10"
            >
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
                <p className="text-sm text-muted-foreground">
                  {payment.date}
                </p>
              </div>
              <Badge variant="outline" className="text-accent">
                {payment.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

