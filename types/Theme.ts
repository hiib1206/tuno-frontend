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
