"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

// 예시 데이터
const financialData = {
  "2021": {
    매출액: 2796048,
    영업이익: 516854,
    당기순이익: 399075,
    자본금: 596978,
    자본총계: 3028817,
    부채총계: 10123456,
    자산총계: 13152273,
    부채비율: 33.4,
    당좌비율: 125.8,
    유보비율: 407.3,
    ROE: 13.2,
    EPS: 5200,
    PER: 15.2,
    BPS: 39400,
    PBR: 2.0,
  },
  "2022": {
    매출액: 3022314,
    영업이익: 433769,
    당기순이익: 555263,
    자본금: 596978,
    자본총계: 3201456,
    부채총계: 10876543,
    자산총계: 14077999,
    부채비율: 30.8,
    당좌비율: 118.5,
    유보비율: 436.2,
    ROE: 17.3,
    EPS: 7200,
    PER: 12.8,
    BPS: 41800,
    PBR: 2.2,
  },
  "2023": {
    매출액: 2589356,
    영업이익: 122015,
    당기순이익: 155000,
    자본금: 596978,
    자본총계: 3156789,
    부채총계: 11234567,
    자산총계: 14391356,
    부채비율: 28.0,
    당좌비율: 105.2,
    유보비율: 428.9,
    ROE: 4.9,
    EPS: 2000,
    PER: 45.5,
    BPS: 41200,
    PBR: 2.2,
  },
  "2024": {
    매출액: 2890123,
    영업이익: 345678,
    당기순이익: 278901,
    자본금: 596978,
    자본총계: 3321456,
    부채총계: 11567890,
    자산총계: 14889346,
    부채비율: 27.7,
    당좌비율: 112.3,
    유보비율: 456.3,
    ROE: 8.4,
    EPS: 3600,
    PER: 25.3,
    BPS: 43200,
    PBR: 2.1,
  },
};

// 숫자 포맷팅 함수
const formatNumber = (value: number, isPercentage = false, isRatio = false) => {
  if (isPercentage) {
    return `${value.toFixed(1)}%`;
  }
  if (isRatio) {
    return value.toFixed(1);
  }
  // 억 단위로 변환
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억`;
  }
  // 천만 단위
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1)}천만`;
  }
  // 만 단위
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}만`;
  }
  return value.toLocaleString();
};

// 재무 지표 그룹 정의
const financialGroups = [
  {
    title: "손익계산서",
    items: [
      { key: "매출액", label: "매출액", unit: "원" },
      { key: "영업이익", label: "영업이익", unit: "원" },
      { key: "당기순이익", label: "당기 순이익", unit: "원" },
    ],
  },
  {
    title: "재무상태표",
    items: [
      { key: "자산총계", label: "자산 총계", unit: "원" },
      { key: "부채총계", label: "부채 총계", unit: "원" },
      { key: "자본총계", label: "자본 총계", unit: "원" },
      { key: "자본금", label: "자본금", unit: "원" },
    ],
  },
  {
    title: "재무비율",
    items: [
      { key: "부채비율", label: "부채 비율", unit: "%", isPercentage: true },
      { key: "당좌비율", label: "당좌 비율", unit: "%", isPercentage: true },
      { key: "유보비율", label: "유보 비율", unit: "%", isPercentage: true },
    ],
  },
  {
    title: "투자지표",
    items: [
      { key: "ROE", label: "ROE", unit: "%", isPercentage: true },
      { key: "EPS", label: "EPS", unit: "원" },
      { key: "PER", label: "PER", unit: "배", isRatio: true },
      { key: "BPS", label: "BPS", unit: "원" },
      { key: "PBR", label: "PBR", unit: "배", isRatio: true },
    ],
  },
];

const years = ["2021", "2022", "2023", "2024"] as const;

export default function FinancePage() {
  return (
    <div className="min-h-screen bg-background-2 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>주요 재무재표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground sticky left-0 bg-background-1 z-10 min-w-[180px]">
                      항목
                    </th>
                    {years.map((year) => (
                      <th
                        key={year}
                        className="text-right py-3 px-4 font-semibold text-foreground min-w-[120px]"
                      >
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {financialGroups.map((group, groupIdx) => (
                    <React.Fragment key={group.title}>
                      {/* 그룹 헤더 */}
                      <tr className="bg-muted/30">
                        <td
                          colSpan={years.length + 1}
                          className="py-2 px-4 font-semibold text-sm text-foreground"
                        >
                          {group.title}
                        </td>
                      </tr>
                      {/* 그룹 항목들 */}
                      {group.items.map((item, itemIdx) => (
                        <tr
                          key={item.key}
                          className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                            itemIdx === group.items.length - 1
                              ? "border-b-2"
                              : ""
                          }`}
                        >
                          <td className="py-2.5 px-4 text-sm text-muted-foreground sticky left-0 bg-background-1 z-10">
                            {item.label}
                          </td>
                          {years.map((year) => {
                            const value =
                              financialData[year][
                                item.key as keyof (typeof financialData)[typeof year]
                              ];
                            return (
                              <td
                                key={year}
                                className="py-2.5 px-4 text-sm text-right font-medium text-foreground"
                              >
                                {formatNumber(
                                  value,
                                  item.isPercentage,
                                  item.isRatio
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
