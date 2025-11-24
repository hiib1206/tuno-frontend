import { Card } from "@/components/ui/card";

interface ConfidenceScoreProps {
  score: number;
}

export function ConfidenceScore({ score }: ConfidenceScoreProps) {
  return (
    <Card className="border-accent/20 bg-accent/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="mb-1 font-semibold">AI 예측 신뢰도</h3>
          <p className="text-sm text-muted-foreground">
            과거 데이터 분석 및 패턴 인식 기반
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-accent">{score}%</div>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/50">
        <div
          className="h-full bg-accent"
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </Card>
  );
}

