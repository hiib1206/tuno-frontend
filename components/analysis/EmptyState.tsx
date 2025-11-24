import { Card } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="flex h-full min-h-[600px] flex-col items-center justify-center p-12 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
        <LineChart className="h-10 w-10 text-accent" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">분석을 시작하세요</h3>
      <p className="text-muted-foreground">
        종목 코드와 기간을 선택하고 예측 시작 버튼을 클릭하세요
      </p>
    </Card>
  );
}

