"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PredictionHistory() {
  const predictions = [
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
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">예측 내역</h2>
          <Button variant="outline" size="sm">
            필터
          </Button>
        </div>

        <div className="space-y-4">
          {predictions.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/5"
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
  );
}

