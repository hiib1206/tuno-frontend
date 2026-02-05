"use client";

import { ErrorState } from "@/components/feedback";
import { ThemeNewsList } from "@/components/market/ThemeNewsList";
import { ThemeNewsListSkeleton } from "@/components/market/ThemeNewsListSkeleton";
import { ThemeStockList } from "@/components/market/ThemeStockList";
import { ThemeStockListSkeleton } from "@/components/market/ThemeStockListSkeleton";
import { ThemeTreemap } from "@/components/market/ThemeTreemap";
import { ThemeTreemapSkeleton } from "@/components/market/ThemeTreemapSkeleton";
import { WorkspaceFeedback } from "@/components/workspace/WorkspaceFeedback";
import { useMarketPolling } from "@/hooks/useMarketPolling";
import { useThemeStore } from "@/stores/themeStore";
import { useEffect } from "react";

export default function ThemePage() {
  const {
    themes,
    selectedTheme,
    isLoadingThemes,
    themesError,
    fetchThemes,
    refreshThemes,
    selectTheme,
  } = useThemeStore();

  // 테마 로드 (자동 선택 없이)
  useEffect(() => {
    fetchThemes(false);
  }, [fetchThemes]);

  // 테마 로드 완료 후 종목 수 기준 자동 선택
  useEffect(() => {
    if (themes.length > 0 && !selectedTheme) {
      const maxTheme = themes.reduce((max, theme) =>
        theme.totcnt > max.totcnt ? theme : max
      );
      selectTheme(maxTheme);
    }
  }, [themes, selectedTheme, selectTheme]);

  // 트리맵에서 테마 선택
  const handleSelectTheme = (tmcode: string) => {
    const theme = themes.find((t) => t.tmcode === tmcode);
    if (theme) selectTheme(theme);
  };

  // 새로고침
  const handleRefresh = () => {
    fetchThemes(false);
  };

  // 장중 1.5초 폴링
  useMarketPolling(() => {
    refreshThemes();
  });

  if (themesError) {
    return (
      <WorkspaceFeedback>
        <ErrorState message={themesError} />
      </WorkspaceFeedback>
    );
  }

  return (
    <div className="xl:flex xl:items-center xl:min-h-full">
      <div className="w-full xl:w-[70vw] xl:h-[1024px] mx-auto flex flex-col xl:flex-row gap-2">
        {/* 트리맵 */}
        <div className="h-[500px] xl:h-full xl:flex-1 shrink-0">
          {isLoadingThemes ? (
            <ThemeTreemapSkeleton />
          ) : (
            <ThemeTreemap data={themes} onSelectTheme={handleSelectTheme} onRefresh={handleRefresh} />
          )}
        </div>

        {/* 종목 리스트 + 뉴스 리스트 */}
        <div className="flex flex-col xl:flex-row xl:contents gap-2">
          <div className="h-[500px] xl:w-90 xl:h-full xl:flex-none">
            {isLoadingThemes || !selectedTheme ? (
              <ThemeStockListSkeleton />
            ) : (
              <ThemeStockList />
            )}
          </div>
          <div className="h-[500px] xl:w-90 xl:h-full xl:flex-none">
            {isLoadingThemes || !selectedTheme ? (
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
