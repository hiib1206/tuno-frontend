import { Card } from "@/components/ui/card";
import { AlertCircle, TrendingUp } from "lucide-react";

interface Insight {
  type: "positive" | "warning";
  title: string;
  items: string[];
}

interface AnalysisInsightsProps {
  insights: Insight[];
}

export function AnalysisInsights({ insights }: AnalysisInsightsProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">AI 분석 인사이트</h3>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`rounded-lg border-l-4 p-4 ${
              insight.type === "positive"
                ? "border-accent bg-accent/5"
                : "border-muted bg-muted/30"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              {insight.type === "positive" ? (
                <TrendingUp className="h-5 w-5 text-accent" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <h4 className="font-semibold">{insight.title}</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {insight.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                      insight.type === "positive"
                        ? "bg-accent"
                        : "bg-muted-foreground"
                    }`}
                  ></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

