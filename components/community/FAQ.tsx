"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

interface FAQComponentProps {
  title?: string;
}

export default function FAQComponent({ title = "FAQ" }: FAQComponentProps) {
  // FAQ 데이터 (나중에 API로 대체 가능)
  const faqData = [
    {
      id: "1",
      question: "서비스 이용 방법은 어떻게 되나요?",
      answer:
        "회원가입 후 로그인하시면 바로 서비스를 이용하실 수 있습니다. 각 메뉴에서 원하는 기능을 선택하여 사용하세요.",
    },
    {
      id: "2",
      question: "주가 분석은 어떻게 하나요?",
      answer:
        "투자 분석 -> 주가 분석 에서 원하는 종목을 검색하고 분석을 요청하시면 AI가 종목에 대한 상세 분석을 제공합니다.",
    },
    {
      id: "3",
      question: "게시글 작성은 어떻게 하나요?",
      answer:
        "커뮤니티 메뉴에서 게시글 작성 버튼을 클릭하시면 에디터가 열립니다. 제목과 내용을 작성한 후 게시하시면 됩니다.",
    },
    {
      id: "4",
      question: "비밀번호를 잊어버렸어요.",
      answer:
        "로그인 페이지에서 '비밀번호 찾기' 기능을 이용하시거나, 고객센터로 문의해주세요.",
    },
    {
      id: "5",
      question: "서비스 이용료가 있나요?",
      answer:
        "기본 서비스는 무료로 이용하실 수 있으며, 프리미엄 기능은 유료 구독이 필요합니다.",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-lg max-w-4xl mx-auto py-4 px-4 md:px-6 bg-background-1"
      )}
    >
      {/* 제목 섹션 */}
      <div className="mb-6 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-accent-text" />
        <h2 className="px-1 text-lg sm:text-xl font-semibold">{title}</h2>
      </div>

      {/* FAQ 리스트 */}
      <div>
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border-0 group hover:bg-background-2 transition-colors duration-200 rounded-lg"
            >
              <AccordionTrigger className="py-4 px-2 text-left hover:no-underline">
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent-text group-hover:bg-accent transition-colors duration-300" />
                  <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-accent-text transition-colors duration-300 flex-1">
                    {faq.question}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-transparent" />
                  <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground/80 leading-relaxed flex-1 transition-colors duration-300">
                    {faq.answer}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
