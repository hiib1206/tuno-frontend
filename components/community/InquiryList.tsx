"use client";

import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import { HelpCircle, Plus } from "lucide-react";
import Link from "next/link";

interface InquiryItem {
  id: string;
  title: string;
  category: string;
  status: "답변 대기" | "답변 완료";
  createdAt: Date;
}

// 카테고리 라벨 매핑
const categoryLabels: Record<string, string> = {
  service: "서비스 이용",
  account: "계정 관련",
  payment: "결제/환불",
  bug: "버그 신고",
  suggestion: "기능 제안",
  etc: "기타",
};

// 더미 데이터
const dummyInquiries: InquiryItem[] = [
  {
    id: "1",
    title: "프리미엄 구독 결제 관련 문의",
    category: "payment",
    status: "답변 완료",
    createdAt: new Date("2024-12-15T10:30:00"),
  },
  {
    id: "2",
    title: "계정 비밀번호 변경이 안됩니다",
    category: "account",
    status: "답변 대기",
    createdAt: new Date("2024-12-14T15:20:00"),
  },
  {
    id: "3",
    title: "차트 분석 기능 개선 제안",
    category: "suggestion",
    status: "답변 완료",
    createdAt: new Date("2024-12-13T09:15:00"),
  },
  {
    id: "4",
    title: "모바일에서 로그인이 안되는 버그",
    category: "bug",
    status: "답변 대기",
    createdAt: new Date("2024-12-12T14:45:00"),
  },
  {
    id: "5",
    title: "서비스 이용 방법 문의",
    category: "service",
    status: "답변 완료",
    createdAt: new Date("2024-12-10T11:00:00"),
  },
];

interface InquiryListProps {
  title?: string;
}

export default function InquiryList({ title = "문의하기" }: InquiryListProps) {
  const inquiries = dummyInquiries;

  return (
    <div className="rounded-lg max-w-4xl mx-auto py-4 px-4 md:px-6 bg-background-1">
      <div className="mb-3 flex flex-row items-center justify-between gap-2 gap-0">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-accent-text" />
          <h2 className="px-1 text-lg sm:text-xl font-semibold">{title}</h2>
        </div>
        <Link href="/community/support/inquiry">
          <Button
            variant="accent"
            size="sm"
            className="w-full sm:w-auto flex flex-col"
          >
            <div className="h-4"></div>
            <div className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>문의하기</span>
            </div>
          </Button>
        </Link>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center">
          <div className="h-px border-t border-border-2" />
          <p className="py-12 text-muted-foreground">작성한 문의가 없습니다.</p>
        </div>
      ) : (
        <div className="min-h-[600px] mt-2">
          <div className="h-px border-t border-border-2" />

          {/* 컬럼 헤더 */}
          <div className="py-3 px-2 bg-background-2/50">
            <div className="px-2 flex items-center gap-4">
              {/* 제목 헤더 */}
              <div className="flex-1 flex justify-center min-w-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  제목
                </span>
              </div>
              <div className="flex flex-row items-center gap-4">
                {/* 카테고리 헤더 */}
                <div className="w-24 flex justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    카테고리
                  </span>
                </div>
                {/* 상태 헤더 */}
                <div className="w-20 flex justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    상태
                  </span>
                </div>
                {/* 작성일 헤더 */}
                <div className="w-26 flex justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    작성일
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-px border-t border-border-2" />

          {/* 리스트 아이템 */}
          <div className="flex flex-col">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="group hover:bg-background-2 transition-colors duration-200 border-b border-border-2"
              >
                <div className="py-3 px-2">
                  <div className="px-2 flex items-center gap-4">
                    {/* 제목 */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/community/support/inquiry/${inquiry.id}`}
                        className="text-sm font-medium line-clamp-1 group-hover:text-accent-text transition-colors duration-300 hover:underline text-foreground"
                      >
                        {inquiry.title}
                      </Link>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                      {/* 카테고리 */}
                      <div className="w-24 flex justify-center text-xs text-muted-foreground flex-shrink-0">
                        <span className="text-xs font-medium text-accent-text">
                          {categoryLabels[inquiry.category] || inquiry.category}
                        </span>
                      </div>

                      {/* 상태 */}
                      <div className="w-20 flex justify-center flex-shrink-0">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            inquiry.status === "답변 완료"
                              ? "text-accent-text"
                              : "text-muted-foreground"
                          )}
                        >
                          {inquiry.status}
                        </span>
                      </div>

                      {/* 작성일 */}
                      <div className="w-26 flex justify-center text-xs text-muted-foreground flex-shrink-0">
                        {formatDateTime(inquiry.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
