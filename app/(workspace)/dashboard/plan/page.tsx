"use client";

import { DemoPopover } from "@/components/ui/DemoPopover";
import { Skeleton } from "@/components/ui/Skeleton";
import { useQuota } from "@/hooks/useQuota";
import { planFeatureGroups, planInfo } from "@/lib/plan-features";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export default function DashboardPlanPage() {
  const { data: quota, isLoading } = useQuota();

  const currentPlan = quota?.role === "PRO" ? "PRO" : "FREE";
  const currentPlanInfo = planInfo[currentPlan];
  const isPro = currentPlan === "PRO";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">내 플랜</h1>

      {/* 현재 플랜 카드 */}
      {isLoading ? (
        <Skeleton variant="shimmer-contrast" className="h-44 rounded-lg" />
      ) : (
        <section
          className={cn(
            "bg-background-2 rounded-lg p-6",
            isPro && "border border-accent"
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2
                  className={cn(
                    "text-lg font-bold",
                    isPro ? "text-accent" : "text-foreground"
                  )}
                >
                  {currentPlanInfo.name}
                </h2>
                {isPro && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-white">
                    현재 플랜
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-extrabold">
                  ₩ {currentPlanInfo.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">/월</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPlanInfo.description}
              </p>
            </div>
            {quota && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">일일 한도</p>
                <p className="text-2xl font-bold">{quota.limit}회</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            {isPro ? (
              <DemoPopover>
                <button className="px-6 py-2.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                  플랜 관리
                </button>
              </DemoPopover>
            ) : (
              <DemoPopover>
                <button className="px-6 py-2.5 rounded-full bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors cursor-pointer">
                  Pro 업그레이드
                </button>
              </DemoPopover>
            )}
          </div>
        </section>
      )}

      {/* 플랜 비교 */}
      <section className="bg-background-2 rounded-lg p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">
          플랜 비교
        </h2>

        {/* 테이블 헤더 */}
        <div className="grid grid-cols-[1fr_80px_80px] gap-2 pb-3 border-b border-border mb-2">
          <div />
          <div className="text-center text-xs font-medium text-muted-foreground">
            Free
          </div>
          <div className="text-center text-xs font-medium text-accent">Pro</div>
        </div>

        {/* 기능 그룹 */}
        <div className="space-y-4">
          {planFeatureGroups.map((group) => (
            <div key={group.category}>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-4">
                {group.category}
              </p>
              <div className="divide-y divide-border">
                {group.features.map((feature) => (
                  <div
                    key={feature.label}
                    className="grid grid-cols-[1fr_80px_80px] gap-2 py-2.5 items-center"
                  >
                    <span className="text-sm text-foreground">
                      {feature.label}
                    </span>
                    <FeatureValue value={feature.free} />
                    <FeatureValue value={feature.pro} isPro />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FeatureValue({
  value,
  isPro,
}: {
  value: boolean | string;
  isPro?: boolean;
}) {
  if (typeof value === "string") {
    return (
      <span
        className={cn(
          "text-center text-sm font-semibold",
          isPro ? "text-accent" : "text-foreground"
        )}
      >
        {value}
      </span>
    );
  }
  return value ? (
    <Check
      className={cn(
        "w-4 h-4 mx-auto",
        isPro ? "text-accent" : "text-muted-foreground"
      )}
      strokeWidth={2.5}
    />
  ) : (
    <X className="w-4 h-4 mx-auto text-muted-foreground/40" strokeWidth={2} />
  );
}
