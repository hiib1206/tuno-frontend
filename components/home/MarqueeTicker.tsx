"use client";

import { TrendingUp } from "lucide-react";

const TICKER_ITEMS = [
  { symbol: "S&P 500", value: "4,783.45", change: "+1.2%" },
  { symbol: "NASDAQ", value: "15,003.22", change: "+0.8%" },
  { symbol: "BTC/USD", value: "43,500.00", change: "+2.5%" },
  { symbol: "ETH/USD", value: "2,250.10", change: "+1.9%" },
  { symbol: "AAPL", value: "195.10", change: "+0.5%" },
  { symbol: "TSLA", value: "245.30", change: "+3.1%" },
  { symbol: "NVDA", value: "480.90", change: "+1.5%" },
  { symbol: "MSFT", value: "375.00", change: "+0.9%" },
];

export default function MarqueeTicker() {
  return (
    <div className="w-full bg-background/50 backdrop-blur-sm border-y border-border overflow-hidden py-3">
      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee whitespace-nowrap flex gap-12 items-center">
          {/* Duplicate items for infinite loop */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map(
            (item, idx) => (
              <div
                key={`${item.symbol}-${idx}`}
                className="flex items-center gap-2 text-sm"
              >
                <span className="font-bold text-foreground">{item.symbol}</span>
                <span className="text-muted-foreground">{item.value}</span>
                <span className="flex items-center text-[var(--color-accent)] font-semibold">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {item.change}
                </span>
              </div>
            )
          )}
        </div>

        {/* Second copy for seamless loop */}
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-12 items-center ml-12">
          {/* Actually, the first div with enough duplicates is usually enough if we use CSS translate. 
               But standard way is two containers. 
               Let's use a standard Tailwind marquee approach: 
               animate-marquee: translateX(-100%)
               We need to define keyframes in globals.css or just use style.
           */}
        </div>
      </div>

      {/* Inline styles for marquee animation since we might not have it in tailwind config yet */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
