"use client";

import { SpecialTheme } from "@/types/Theme";
import ReactECharts from "echarts-for-react";
import { RotateCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ThemeTreemapProps {
  data: SpecialTheme[];
  onSelectTheme?: (tmcode: string) => void;
  onRefresh?: () => void;
}

export function ThemeTreemap({ data, onSelectTheme, onRefresh }: ThemeTreemapProps) {
  const [chartColors, setChartColors] = useState({
    up: "",
    down: "",
    tooltipBg: "",
    tooltipText: "",
  });

  useEffect(() => {
    const updateColors = () => {
      const styles = getComputedStyle(document.documentElement);
      setChartColors({
        up: styles.getPropertyValue("--chart-up").trim(),
        down: styles.getPropertyValue("--chart-down").trim(),
        tooltipBg: styles.getPropertyValue("--background-1").trim(),
        tooltipText: styles.getPropertyValue("--foreground").trim(),
      });
    };

    // html 요소의 class 변경 감지
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 초기값 설정
    updateColors();

    return () => observer.disconnect();
  }, []);

  // hex를 rgba로 변환 + 어둡게 조절
  // darkenPercent: 0 = 원본, 20 = 20% 어둡게
  const adjustColor = (hex: string, opacity: number, darkenPercent: number = 5): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const factor = 1 - darkenPercent / 100;
    const r = Math.round(parseInt(result[1], 16) * factor);
    const g = Math.round(parseInt(result[2], 16) * factor);
    const b = Math.round(parseInt(result[3], 16) * factor);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // 기본 색상 (툴팁용)
  const getColor = (avgdiff: number): string => {
    return avgdiff >= 0 ? chartColors.up : chartColors.down;
  };

  const option = useMemo(() => {
    // 최대 종목수 계산 (동적 비율용)
    const maxValue = Math.max(...data.map((d) => d.totcnt));

    // 상승/하락 최대 등락률 계산
    const upThemes = data.filter((d) => d.avgdiff >= 0);
    const downThemes = data.filter((d) => d.avgdiff < 0);
    const maxUp = upThemes.length > 0 ? Math.max(...upThemes.map((d) => d.avgdiff)) : 1;
    const minDown = downThemes.length > 0 ? Math.min(...downThemes.map((d) => d.avgdiff)) : -1;

    // 등락률 비율에 따른 opacity 계산
    const getOpacity = (avgdiff: number): number => {
      let ratio: number;
      if (avgdiff >= 0) {
        ratio = maxUp > 0 ? avgdiff / maxUp : 1;
      } else {
        ratio = minDown < 0 ? avgdiff / minDown : 1;
      }

      // 3단계 opacity
      if (ratio > 0.66) return 1.0;
      if (ratio > 0.33) return 0.9;
      return 0.8;
    };

    const treemapData = data.map((theme) => ({
      name: theme.tmname,
      value: theme.totcnt,
      avgdiff: theme.avgdiff,
      totcnt: theme.totcnt,
      upcnt: theme.upcnt,
      dncnt: theme.dncnt,
      tmcode: theme.tmcode,
      itemStyle: {
        color: adjustColor(getColor(theme.avgdiff), getOpacity(theme.avgdiff)),
      },
    }));

    return {
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        borderColor: chartColors.tooltipBg,
        textStyle: {
          color: chartColors.tooltipText,
          fontSize: 12,
        },
        formatter: (params: any) => {
          const { name, data } = params;
          const diff = data.avgdiff >= 0 ? `+${data.avgdiff}` : data.avgdiff;
          return `
            <div class="font-medium">${name}</div>
            <div>평균 등락율: <span style="color: ${getColor(data.avgdiff)}">${diff}%</span></div>
            <div>종목 수: ${data.totcnt}개</div>
            <div>상승: ${data.upcnt} / 하락: ${data.dncnt}</div>
          `;
        },
      },
      series: [
        {
          type: "treemap",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          roam: false,
          nodeClick: "link",
          breadcrumb: { show: false },
          label: {
            show: true,
            formatter: (params: any) => {
              const value = params.data.value;
              const ratio = value / maxValue;
              const diff =
                params.data.avgdiff >= 0
                  ? `+${params.data.avgdiff}`
                  : params.data.avgdiff;

              // 비율에 따라 다른 스타일 사용
              if (ratio > 0.7) {
                return `{nameLg|${params.name}}\n{diffLg|${diff}%}`;
              } else if (ratio > 0.4) {
                return `{nameMd|${params.name}}\n{diffMd|${diff}%}`;
              } else if (ratio > 0.2) {
                return `{nameSm|${params.name}}\n{diffSm|${diff}%}`;
              } else {
                return `{nameXs|${params.name}}\n{diffXs|${diff}%}`;
              }
            },
            rich: {
              nameLg: {
                fontSize: 22,
                fontWeight: "bold",
                color: "#fff",
                lineHeight: 28,
              },
              diffLg: {
                fontSize: 18,
                color: "#fff",
                lineHeight: 24,
              },
              nameMd: {
                fontSize: 18,
                fontWeight: "bold",
                color: "#fff",
                lineHeight: 24,
              },
              diffMd: {
                fontSize: 16,
                color: "#fff",
                lineHeight: 22,
              },
              nameSm: {
                fontSize: 16,
                fontWeight: "bold",
                color: "#fff",
                lineHeight: 22,
              },
              diffSm: {
                fontSize: 14,
                color: "#fff",
                lineHeight: 20,
              },
              nameXs: {
                fontSize: 14,
                fontWeight: "bold",
                color: "#fff",
                lineHeight: 20,
              },
              diffXs: {
                fontSize: 12,
                color: "#fff",
                lineHeight: 18,
              },
            },
          },
          labelLayout: (params: any) => {
            const area = params.rect.width * params.rect.height;

            // 면적이 10000px² 미만이면 라벨 숨김
            if (area < 10000) {
              return { x: -9999, y: -9999 };
            }

            const labelHeight = params.labelRect?.height || 0;
            return {
              x: params.rect.x + params.rect.width / 2,
              y: params.rect.y + params.rect.height / 2 - labelHeight / 2,
              align: "center",
            };
          },
          itemStyle: {
            borderColor: "transparent",
            borderWidth: 1,
            gapWidth: 2,
          },
          data: treemapData,
        },
      ],
    };
  }, [data, chartColors]);

  const onEvents = {
    click: (params: any) => {
      if (params.data?.tmcode && onSelectTheme) {
        onSelectTheme(params.data.tmcode);
      }
    },
  };

  return (
    <div className="h-full w-full p-4 bg-background-1 rounded-md flex flex-col">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">주요 테마</h2>
          <span className="text-xs text-muted-foreground">※ 실시간 정보는 제공되지 않습니다</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-background-2 rounded-md transition-colors text-foreground-2 hover:text-foreground"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 트리맵 */}
      <div className="flex-1">
        <ReactECharts
          option={option}
          style={{ width: "100%", height: "100%" }}
          opts={{ renderer: "svg" }}
          onEvents={onEvents}
        />
      </div>
    </div>
  );
}
