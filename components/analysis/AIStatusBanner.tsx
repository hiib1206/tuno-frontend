import { Card } from "@/components/ui/card";
import { Brain } from "lucide-react";

export function AIStatusBanner() {
  return (
    <Card className="mb-8 border-accent/20 bg-accent/5 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <Brain className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">AI 모델</h3>
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
  );
}

