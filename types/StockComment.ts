/** 종목 댓글 의견 타입 (BUY = 매수, SELL = 매도, NEUTRAL = 중립) */
export type StockCommentOpinion = "BUY" | "SELL" | "NEUTRAL";

/** 종목 댓글 작성자 정보 */
export interface StockCommentAuthor {
  /** 사용자 ID */
  id: number;
  /** 닉네임 */
  nick: string;
  /** 프로필 이미지 URL */
  profileImageUrl: string | null;
}

/** 종목 댓글 */
export interface StockComment {
  /** 댓글 ID */
  id: string;
  /** 종목 코드 */
  ticker: string;
  /** 거래소 코드 */
  exchange: string;
  /** 댓글 내용 */
  content: string;
  /** 의견 (매수/매도/중립) */
  opinion: StockCommentOpinion;
  /** 작성자 정보 */
  author: StockCommentAuthor;
  /** 작성 일시 */
  createdAt: Date;
  /** 수정 일시 */
  updatedAt: Date;
}

/**
 * API 응답을 StockComment 타입으로 변환한다.
 *
 * @param data - API 응답 데이터
 * @returns 파싱된 종목 댓글 객체
 */
export function parseStockComment(data: any): StockComment {
  return {
    id: String(data.id ?? ""),
    ticker: data.ticker ?? "",
    exchange: data.exchange ?? "",
    content: data.content ?? "",
    opinion: data.opinion ?? "NEUTRAL",
    author: {
      id: Number(data.author?.id ?? 0),
      nick: data.author?.nick ?? "",
      profileImageUrl: data.author?.profileImageUrl ?? null,
    },
    createdAt: data.createdAt
      ? typeof data.createdAt === "string"
        ? new Date(data.createdAt)
        : data.createdAt
      : new Date(),
    updatedAt: data.updatedAt
      ? typeof data.updatedAt === "string"
        ? new Date(data.updatedAt)
        : data.updatedAt
      : new Date(),
  };
}
