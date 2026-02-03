// 종목 댓글 의견 타입
export type StockCommentOpinion = "BUY" | "SELL" | "NEUTRAL";

// 종목 댓글 작성자 타입
export interface StockCommentAuthor {
  id: number;
  nick: string;
  profileImageUrl: string | null;
}

// 종목 댓글 타입
export interface StockComment {
  id: string;
  ticker: string;
  exchange: string;
  content: string;
  opinion: StockCommentOpinion;
  author: StockCommentAuthor;
  createdAt: Date;
  updatedAt: Date;
}

// API 응답 → StockComment 변환
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
