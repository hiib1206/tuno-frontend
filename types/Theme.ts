/**
 * 특이테마 정렬 기준 타입
 *
 * - 1: 상승율 상위
 * - 2: 하락율 상위
 * - 3: 거래증가율 상위
 * - 4: 거래증가율 하위
 * - 5: 상승종목비율 상위
 * - 6: 상승종목비율 하위
 * - 7: 기준대비 상승율 상위
 * - 8: 기준대비 하락율 상위
 */
export type SpecialThemeGubun =
  | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

/** 특이테마 객체 타입 */
export type SpecialTheme = {
  /** 테마명 */
  tmname: string;
  /** 전체 종목수 */
  totcnt: number;
  /** 상승 종목수 */
  upcnt: number;
  /** 하락 종목수 */
  dncnt: number;
  /** 상승 비율 (%) */
  uprate: number;
  /** 거래증가율 (%) */
  diffVol: number;
  /** 평균 등락율 (%) */
  avgdiff: number;
  /** 대비 등락율 (%) */
  chgdiff: number;
  /** 테마코드 */
  tmcode: string;
};

/** 테마 종목 정보 타입 */
export type ThemeStockInfo = {
  /** 상승 종목 수 */
  upcnt: number;
  /** 테마 종목 수 */
  tmcnt: number;
  /** 상승 비율 */
  uprate: number;
  /** 테마 이름 */
  tmname: string;
};

/** 테마 내 개별 종목 타입 */
export type ThemeStock = {
  /** 종목명 */
  hname: string;
  /** 현재가 */
  price: number;
  /** 등락 부호 */
  sign: string;
  /** 전일 대비 */
  change: number;
  /** 등락률 */
  diff: number;
  /** 거래량 */
  volume: number;
  /** 전일 시간 */
  jniltime: number;
  /** 종목 코드 */
  shcode: string;
  /** 예상가 */
  yeprice: number;
  /** 시가 */
  open: number;
  /** 고가 */
  high: number;
  /** 저가 */
  low: number;
  /** 거래대금 (백만단위) */
  value: number;
  /** 시가총액 (백만단위) */
  marketcap: number;
  /** 거래소 코드 (KP, KQ 등) */
  exchange?: string | null;
};

/**
 * API 응답을 SpecialTheme 타입으로 변환한다.
 *
 * @param raw - API 응답 데이터
 * @returns 파싱된 특이테마 객체
 */
export const parseSpecialTheme = (raw: Record<string, unknown>): SpecialTheme => ({
  tmname: String(raw.tmname),
  totcnt: Number(raw.totcnt),
  upcnt: Number(raw.upcnt),
  dncnt: Number(raw.dncnt),
  uprate: Number(raw.uprate),
  diffVol: Number(raw.diffVol),
  avgdiff: Number(raw.avgdiff),
  chgdiff: Number(raw.chgdiff),
  tmcode: String(raw.tmcode),
});

/**
 * API 응답을 ThemeStockInfo 타입으로 변환한다.
 *
 * @param raw - API 응답 데이터
 * @returns 파싱된 테마 종목 정보
 */
export const parseThemeStockInfo = (raw: Record<string, unknown>): ThemeStockInfo => ({
  upcnt: Number(raw.upcnt),
  tmcnt: Number(raw.tmcnt),
  uprate: Number(raw.uprate),
  tmname: String(raw.tmname),
});

/**
 * API 응답을 ThemeStock 타입으로 변환한다.
 *
 * @param raw - API 응답 데이터
 * @returns 파싱된 테마 종목 데이터
 */
export const parseThemeStock = (raw: Record<string, unknown>): ThemeStock => ({
  hname: String(raw.hname),
  price: Number(raw.price),
  sign: String(raw.sign),
  change: Number(raw.change),
  diff: Number(raw.diff),
  volume: Number(raw.volume),
  jniltime: Number(raw.jniltime),
  shcode: String(raw.shcode),
  yeprice: Number(raw.yeprice),
  open: Number(raw.open),
  high: Number(raw.high),
  low: Number(raw.low),
  value: Number(raw.value),
  marketcap: Number(raw.marketcap),
  exchange: raw.exchange ? String(raw.exchange) : null,
});
