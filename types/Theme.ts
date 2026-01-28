// 특이테마 정렬 기준 타입
export type SpecialThemeGubun =
  | "1" // 상승율 상위
  | "2" // 하락율 상위
  | "3" // 거래증가율 상위
  | "4" // 거래증가율 하위
  | "5" // 상승종목비율 상위
  | "6" // 상승종목비율 하위
  | "7" // 기준대비 상승율 상위
  | "8"; // 기준대비 하락율 상위

// 특이테마 객체 타입
export type SpecialTheme = {
  tmname: string; // 테마명
  totcnt: number; // 전체 종목수
  upcnt: number; // 상승 종목수
  dncnt: number; // 하락 종목수
  uprate: number; // 상승 비율 (%)
  diffVol: number; // 거래증가율 (%)
  avgdiff: number; // 평균 등락율 (%)
  chgdiff: number; // 대비 등락율 (%)
  tmcode: string; // 테마코드
};

// 테마 종목 정보 타입
export type ThemeStockInfo = {
  upcnt: number; // 상승 종목 수
  tmcnt: number; // 테마 종목 수
  uprate: number; // 상승 비율
  tmname: string; // 테마 이름
};

// 테마 내 개별 종목 타입
export type ThemeStock = {
  hname: string; // 종목명
  price: number; // 현재가
  sign: string; // 등락 부호
  change: number; // 전일 대비
  diff: number; // 등락률
  volume: number; // 거래량
  jniltime: number; // 전일 시간
  shcode: string; // 종목 코드
  yeprice: number; // 예상가
  open: number; // 시가
  high: number; // 고가
  low: number; // 저가
  value: number; // 거래대금 (백만단위)
  marketcap: number; // 시가총액 (백만단위)
  exchange?: string | null; // 거래소 코드 (KP, KQ 등)
};

// 특이테마 데이터 변환 (문자열 -> 숫자)
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

// 테마 종목 정보 변환 (문자열 -> 숫자)
export const parseThemeStockInfo = (raw: Record<string, unknown>): ThemeStockInfo => ({
  upcnt: Number(raw.upcnt),
  tmcnt: Number(raw.tmcnt),
  uprate: Number(raw.uprate),
  tmname: String(raw.tmname),
});

// 테마 종목 데이터 변환 (문자열 -> 숫자)
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
