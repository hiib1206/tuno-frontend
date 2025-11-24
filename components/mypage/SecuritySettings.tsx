"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogOut } from "lucide-react";

export function SecuritySettings() {
  return (
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
                {
                  label: "2단계 인증 활성화",
                  description: "추가 보안 레이어로 계정 보호",
                },
                {
                  label: "로그인 알림",
                  description: "새로운 기기 로그인 시 이메일 알림",
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
                {
                  device: "Windows PC",
                  location: "서울, 대한민국",
                  time: "현재 세션",
                },
                {
                  device: "iPhone 15",
                  location: "서울, 대한민국",
                  time: "2시간 전",
                },
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    >
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
          계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은
          되돌릴 수 없습니다.
        </p>

        <Button
          variant="outline"
          className="text-destructive hover:bg-destructive/10"
        >
          계정 삭제
        </Button>
      </Card>
    </div>
  );
}
