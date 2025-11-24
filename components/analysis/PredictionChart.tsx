import { Card } from "@/components/ui/card";

export function PredictionChart() {
  return (
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
  );
}
