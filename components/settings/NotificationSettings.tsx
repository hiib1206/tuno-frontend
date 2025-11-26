"use client";

import { Button } from "@/components/ui/button";

export function NotificationSettings() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="mb-6 text-2xl font-bold">알림 설정</h2>

      <div className="space-y-6">
        <div>
          <h3 className="mb-4 font-semibold">이메일 알림</h3>
          <div className="space-y-3">
            {[
              {
                label: "예측 완료 알림",
                description: "AI 분석이 완료되면 알림",
              },
              {
                label: "주간 리포트",
                description: "매주 월요일 요약 리포트 발송",
              },
              {
                label: "마케팅 정보",
                description: "새로운 기능 및 프로모션",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
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
              {
                label: "실시간 시장 알림",
                description: "즐겨찾기 종목의 급등/급락",
              },
              {
                label: "예측 알림",
                description: "예측 결과 및 인사이트",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  끄기
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
