import { SpecialTheme, SpecialThemeGubun, ThemeStockInfo, ThemeStock } from "@/types/Theme";
import apiClient from "./apiClient";

// 특이테마 조회 쿼리 파라미터 타입
type SpecialThemeQueryParams = {
  gubun?: SpecialThemeGubun; // 정렬 기준 (기본값 "1")
};

// 특이테마 조회 응답 타입
type SpecialThemeResult = {
  success: boolean;
  message: string;
  data: {
    top: SpecialTheme[]; // 상위 15개 테마
    bottom: SpecialTheme[]; // 하위 15개 테마
  } | null;
};

// 테마 종목 조회 응답 타입
type ThemeStocksResult = {
  success: boolean;
  message: string;
  data: {
    info: ThemeStockInfo;
    stocks: ThemeStock[];
  } | null;
};

const themeApi = {
  // 특이테마 조회
  getSpecialThemes: async (
    params?: SpecialThemeQueryParams
  ): Promise<SpecialThemeResult> => {
    const response = await apiClient.get("/api/theme/special", {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as {
        top: SpecialTheme[];
        bottom: SpecialTheme[];
      } | null,
    };
  },

  // 테마 종목 조회
  getThemeStocks: async (tmcode: string): Promise<ThemeStocksResult> => {
    const response = await apiClient.get(`/api/theme/${tmcode}/stocks`);
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as {
        info: ThemeStockInfo;
        stocks: ThemeStock[];
      } | null,
    };
  },
};

export default themeApi;

// 타입 export
export type {
  SpecialTheme, SpecialThemeGubun, ThemeStockInfo, ThemeStock,
  SpecialThemeQueryParams, SpecialThemeResult, ThemeStocksResult
};

