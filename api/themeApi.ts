import {
  SpecialTheme,
  SpecialThemeGubun,
  ThemeStock,
  ThemeStockInfo,
  parseSpecialTheme,
  parseThemeStock,
  parseThemeStockInfo,
} from "@/types/Theme";
import apiClient from "./apiClient";

/** 특이테마 조회 쿼리 파라미터 */
type SpecialThemeQueryParams = {
  /** 정렬 기준 (기본값 "1") */
  gubun?: SpecialThemeGubun;
};

/** 특이테마 조회 응답 */
type SpecialThemeResult = {
  success: boolean;
  message: string;
  data: {
    /** 상위 15개 테마 */
    top: SpecialTheme[];
    /** 하위 15개 테마 */
    bottom: SpecialTheme[];
  } | null;
};

/** 테마 종목 조회 응답 */
type ThemeStocksResult = {
  success: boolean;
  message: string;
  data: {
    /** 테마 정보 */
    info: ThemeStockInfo;
    /** 테마 종목 목록 */
    stocks: ThemeStock[];
  } | null;
};

/**
 * 테마 관련 API
 *
 * @remarks
 * 특이테마 조회 및 테마별 종목 조회를 처리한다.
 */
const themeApi = {
  /**
   * 특이테마 목록을 조회한다.
   *
   * @param params - 쿼리 파라미터
   */
  getSpecialThemes: async (
    params?: SpecialThemeQueryParams
  ): Promise<SpecialThemeResult> => {
    const response = await apiClient.get("/api/theme/special", {
      params,
    });

    const rawData = response.data.data;
    const data = rawData
      ? {
          top: rawData.top.map(parseSpecialTheme),
          bottom: rawData.bottom.map(parseSpecialTheme),
        }
      : null;

    return {
      success: response.data.success,
      message: response.data.message,
      data,
    };
  },

  /**
   * 테마에 속한 종목 목록을 조회한다.
   *
   * @param tmcode - 테마 코드
   */
  getThemeStocks: async (tmcode: string): Promise<ThemeStocksResult> => {
    const response = await apiClient.get(`/api/theme/${tmcode}/stocks`);

    const rawData = response.data.data;
    const data = rawData
      ? {
          info: parseThemeStockInfo(rawData.info),
          stocks: rawData.stocks.map(parseThemeStock),
        }
      : null;

    return {
      success: response.data.success,
      message: response.data.message,
      data,
    };
  },
};

export default themeApi;

// 타입 export
export type {
  SpecialTheme, SpecialThemeGubun, ThemeStock, ThemeStockInfo,
  SpecialThemeQueryParams, SpecialThemeResult, ThemeStocksResult
};

