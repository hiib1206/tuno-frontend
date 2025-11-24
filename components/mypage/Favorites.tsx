"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Favorites() {
  const stocks = [
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      price: "$182.52",
      change: "+2.4%",
    },
    {
      ticker: "TSLA",
      name: "Tesla Inc.",
      price: "$242.84",
      change: "+1.8%",
    },
    {
      ticker: "NVDA",
      name: "NVIDIA Corp.",
      price: "$875.28",
      change: "+5.2%",
    },
    {
      ticker: "005930",
      name: "삼성전자",
      price: "₩71,200",
      change: "+1.1%",
    },
    {
      ticker: "MSFT",
      name: "Microsoft Corp.",
      price: "$420.55",
      change: "+0.8%",
    },
    {
      ticker: "GOOGL",
      name: "Alphabet Inc.",
      price: "$162.28",
      change: "+1.5%",
    },
    {
      ticker: "AMZN",
      name: "Amazon.com",
      price: "$180.75",
      change: "+2.1%",
    },
    {
      ticker: "035420",
      name: "NAVER",
      price: "₩215,500",
      change: "+0.5%",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">즐겨찾기</h2>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            종목 추가
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stocks.map((stock, index) => (
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
                  <p className="text-sm text-muted-foreground">
                    {stock.ticker}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{stock.price}</p>
                <p className="text-sm font-medium text-accent">
                  {stock.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
