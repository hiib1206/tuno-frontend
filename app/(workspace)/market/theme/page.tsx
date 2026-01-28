"use client";

import themeApi from "@/api/themeApi";
import { ErrorState } from "@/components/feedback";
import { ThemeNewsList } from "@/components/market/ThemeNewsList";
import { ThemeNewsListSkeleton } from "@/components/market/ThemeNewsListSkeleton";
import { ThemeStockList } from "@/components/market/ThemeStockList";
import { ThemeStockListSkeleton } from "@/components/market/ThemeStockListSkeleton";
import { ThemeTreemap } from "@/components/market/ThemeTreemap";
import { ThemeTreemapSkeleton } from "@/components/market/ThemeTreemapSkeleton";
import { WorkspaceFeedback } from "@/components/workspace/WorkspaceFeedback";
import { SpecialTheme } from "@/types/Theme";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function ThemePage() {
  const [themes, setThemes] = useState<SpecialTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTmcode, setSelectedTmcode] = useState<string | null>(null);

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await themeApi.getSpecialThemes();
      if (res.success && res.data) {
        // top과 bottom 합쳐서 전체 테마 표시
        const allThemes = [...res.data.top, ...res.data.bottom];
        setThemes(allThemes);
        // 종목 수 가장 많은 테마 자동 선택
        if (allThemes.length > 0) {
          const maxTheme = allThemes.reduce((max, theme) =>
            theme.totcnt > max.totcnt ? theme : max
          );
          setSelectedTmcode(maxTheme.tmcode);
        }
      } else {
        setError("테마 데이터를 불러오는데 실패했습니다.");
      }
    } catch {
      setError("테마 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  // 선택된 테마 정보
  const selectedTheme = useMemo(() => {
    return themes.find((t) => t.tmcode === selectedTmcode);
  }, [themes, selectedTmcode]);

  if (error) {
    return (
      <WorkspaceFeedback>
        <ErrorState message={error} />
      </WorkspaceFeedback>
    );
  }

  return (
    <div className="xl:flex xl:items-center xl:min-h-full">
      <div className="w-full xl:w-[70vw] xl:h-[1024px] mx-auto flex flex-col xl:flex-row gap-2">
      {/* 트리맵 */}
      <div className="h-[500px] xl:h-full xl:flex-1 shrink-0">
        {loading ? (
          <ThemeTreemapSkeleton />
        ) : (
          <ThemeTreemap data={themes} onSelectTheme={setSelectedTmcode} onRefresh={fetchThemes} />
        )}
      </div>

      {/* 종목 리스트 + 뉴스 리스트 */}
      <div className="flex flex-col xl:flex-row xl:contents gap-2">
        <div className="h-[500px] xl:w-90 xl:h-full xl:flex-none">
          {loading || !selectedTmcode ? (
            <ThemeStockListSkeleton />
          ) : (
            <ThemeStockList tmcode={selectedTmcode} />
          )}
        </div>
        <div className="h-[500px] xl:w-90 xl:h-full xl:flex-none">
          {loading || !selectedTheme ? (
            <ThemeNewsListSkeleton />
          ) : (
            <ThemeNewsList tmname={selectedTheme.tmname} />
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
