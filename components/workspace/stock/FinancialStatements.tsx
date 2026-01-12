"use client";

import stockApi from "@/api/stockApi";
import { ErrorState } from "@/components/feedback/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialSummary, StockInfo } from "@/types/Stock";
import { ScrollText } from "lucide-react";
import React, { useEffect, useState } from "react";

interface FinancialStatementsProps {
  stockInfo: StockInfo;
}

// 데이터 없음 표시 상수 (한 곳에서 관리)
const NO_DATA = "N/A";

const formatNumber = (
  value: string | null | undefined,
  isPercentage = false
) => {
  if (!value) return NO_DATA;

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;

  return numValue.toLocaleString("ko-KR");
};

const financialGroups = [
  {
    title: "손익계산서",
    items: [
      { key: "revenue", label: "매출액", unit: "억원" },
      { key: "operatingIncome", label: "영업이익", unit: "억원" },
      { key: "netIncome", label: "당기 순이익", unit: "억원" },
    ],
  },
  {
    title: "재무상태표",
    items: [
      { key: "totalAssets", label: "자산 총계", unit: "억원" },
      { key: "totalLiabilities", label: "부채 총계", unit: "억원" },
      { key: "totalEquity", label: "자본 총계", unit: "억원" },
      { key: "capitalStock", label: "자본금", unit: "억원" },
    ],
  },
  {
    title: "재무비율",
    items: [
      { key: "debtRatio", label: "부채 비율", isPercentage: true, unit: "%" },
      { key: "quickRatio", label: "당좌 비율", isPercentage: true, unit: "%" },
      {
        key: "retainedEarningsRatio",
        label: "유보 비율",
        isPercentage: true,
        unit: "%",
      },
    ],
  },
  {
    title: "투자지표",
    items: [
      { key: "roe", label: "ROE", isPercentage: true, unit: "%" },
      { key: "eps", label: "EPS", unit: "원" },
      { key: "bps", label: "BPS", unit: "원" },
    ],
  },
];

export function FinancialStatements({ stockInfo }: FinancialStatementsProps) {
  const [data, setData] = useState<FinancialSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await stockApi.getFinancials(stockInfo.code, {
          period: "y", // 연간 데이터만 조회
          order: "desc",
        });
        setData(response.data);
      } catch (err: any) {
        setError("재무제표 데이터를 불러오는데 실패했습니다.");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (stockInfo) {
      fetchFinancialData();
    }
  }, [stockInfo]);

  // 연도별로 데이터 그룹화 (fidDivClsCode가 'Y'인 연도 데이터만)
  // 오름차순 정렬: 왼쪽이 과거(2021), 오른쪽이 최근(2024)
  const yearlyData = data
    .filter((item) => item.fidDivClsCode === "Y")
    .sort((a, b) => a.stacYymm.localeCompare(b.stacYymm));

  // stacYymm에서 연도/월 추출 (예: "202112" -> "2021.12")
  const getYearMonthFromStacYymm = (stacYymm: string) => {
    const year = stacYymm.substring(0, 4); // "2021"
    const month = stacYymm.substring(4, 6); // "12"
    return `${year}.${month}`;
  };

  // 최근 4년치를 기본값으로 생성 (데이터가 없을 때)
  const getDefaultYearMonths = () => {
    const currentYear = new Date().getFullYear();
    const months = [];
    for (let i = 0; i < 4; i++) {
      months.push(`${currentYear - i}.12`);
    }
    return months;
  };

  // 데이터가 있으면 실제 연도 사용, 없으면 최근 4년치 기본값 사용
  const yearMonths =
    yearlyData.length > 0
      ? yearlyData.map((item) => getYearMonthFromStacYymm(item.stacYymm))
      : getDefaultYearMonths();

  const hasData = yearlyData.length > 0;

  return (
    <Card variant="workspace" className="h-full min-h-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-accent-text flex-shrink-0" />
            <CardTitle>요약 재무재표</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            ※ 추정치(E)를 제외한 공시/확정 연도만 노출됩니다.
            <br />
            마우스를 올리면 전체 값을 확인할 수 있습니다.
          </p>
        </div>
      </CardHeader>
      <CardContent className="h-full flex flex-col min-h-0">
        {isLoading ? (
          <div className="mt-4 flex-1 skeleton-gradient-loading rounded-lg transition-opacity duration-300" />
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <ErrorState message={error} />
          </div>
        ) : (
          <div className="overflow-x-auto mt-2 flex-1 transition-opacity duration-300">
            <table
              className="border-collapse table-fixed"
              style={{
                width: "100%",
                minWidth: `${150 + yearMonths.length * 100}px`,
              }}
            >
              <colgroup>
                <col style={{ width: "150px" }} />
                {yearMonths.map((_, index) => {
                  // 항목 열을 제외한 나머지 공간을 연도 개수로 균등 분배
                  const yearColumnWidth = `calc((100% - 150px) / ${yearMonths.length})`;
                  return (
                    <col
                      key={`col-${index}`}
                      style={{ width: yearColumnWidth }}
                    />
                  );
                })}
              </colgroup>
              <thead>
                <tr className="border-b-2 border-border/50">
                  <th className="text-center py-1 px-4 font-semibold text-foreground sticky left-0 bg-background-1 z-20 min-w-[150px]">
                    항목
                  </th>
                  {yearMonths.map((yearMonth, index) => (
                    <th
                      key={yearMonth}
                      className="text-right py-1 px-4 font-semibold text-foreground min-w-[100px]"
                    >
                      {yearMonth}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {financialGroups.map((group) => (
                  <React.Fragment key={group.title}>
                    <tr className="bg-muted">
                      <td className="py-2 px-4 font-semibold text-sm text-foreground sticky left-0 bg-muted z-10 border-r border-border min-w-[150px]">
                        {group.title}
                      </td>
                      {yearMonths.map((yearMonth, index) => (
                        <td
                          key={yearMonth}
                          className={`py-2 px-4 font-semibold text-sm text-foreground bg-muted min-w-[100px] ${
                            index < yearMonths.length - 1
                              ? "border-r border-border"
                              : ""
                          }`}
                        />
                      ))}
                    </tr>
                    {group.items.map((item, itemIdx) => (
                      <tr
                        key={item.key}
                        className={`group border-b border-border/50 hover:bg-muted/20 transition-colors ${
                          itemIdx === group.items.length - 1 ? "border-b-2" : ""
                        }`}
                      >
                        <td className="py-2.5 px-4 text-sm text-muted-foreground sticky left-0 bg-background-1 group-hover:bg-muted/20 z-30 transition-colors border-r border-border min-w-[150px]">
                          {item.label}
                          {item.unit && (
                            <span className="text-xs text-muted-foreground/70">
                              ({item.unit})
                            </span>
                          )}
                        </td>
                        {yearMonths.map((yearMonth, index) => {
                          // 데이터 자체가 없으면 빈 값 표시
                          if (!hasData) {
                            return (
                              <td
                                key={yearMonth}
                                className={`py-2.5 px-4 text-sm text-right font-medium text-foreground min-w-[100px] ${
                                  index < yearMonths.length - 1
                                    ? "border-r border-border"
                                    : ""
                                }`}
                              />
                            );
                          }

                          // 해당 연도/월의 데이터 찾기
                          const yearData = yearlyData.find(
                            (item) =>
                              getYearMonthFromStacYymm(item.stacYymm) ===
                              yearMonth
                          );

                          // 해당 연도 데이터가 없으면 빈 값 표시
                          if (!yearData) {
                            return (
                              <td
                                key={yearMonth}
                                className={`py-2.5 px-4 text-sm text-right font-medium text-foreground min-w-[100px] ${
                                  index < yearMonths.length - 1
                                    ? "border-r border-border"
                                    : ""
                                }`}
                              />
                            );
                          }

                          // 데이터는 있는데 특정 필드 값이 없을 때만 "N/A" 표시
                          const value = yearData[
                            item.key as keyof FinancialSummary
                          ] as string | null | undefined;

                          // 음수 여부 확인
                          const numValue =
                            value !== undefined && value !== null
                              ? parseFloat(value)
                              : null;
                          const isNegative =
                            numValue !== null &&
                            !isNaN(numValue) &&
                            numValue < 0;

                          const formattedValue =
                            value !== undefined && value !== null
                              ? formatNumber(value, item.isPercentage)
                              : NO_DATA;

                          return (
                            <td
                              key={yearMonth}
                              className={`py-2.5 px-4 text-sm text-right font-medium min-w-[100px] truncate ${
                                isNegative ? "text-red-500" : "text-foreground"
                              } ${
                                index < yearMonths.length - 1
                                  ? "border-r border-border"
                                  : ""
                              }`}
                              title={formattedValue}
                            >
                              {formattedValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* 데이터가 전혀 없을 때 빨간 안내문구 */}
            {!hasData && (
              <div className="mt-3 text-xs text-destructive">
                해당 종목의 공시 재무데이터는 제공되지 않습니다.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
