"use client";

import FAQComponent from "@/components/community/FAQ";
import InquiryComponent from "@/components/community/Inquiry";
import { ErrorState } from "@/components/feedback/error-state";
import { supportCategoryItems } from "@/lib/community";
import { useParams } from "next/navigation";

export default function SupportCategoryPage() {
  const params = useParams();
  const categoryPath = params.category as string;

  // supportCategoryItems에서 현재 category와 일치하는 항목 찾기
  const currentItem = supportCategoryItems.find(
    (item) => item.href === `/community/support/${categoryPath}`
  );
  const title = currentItem?.label || "고객센터";

  return (
    <div className="space-y-6">
      {categoryPath === "faq" && <FAQComponent title={title} />}
      {categoryPath === "inquiry" && <InquiryComponent title={title} />}
      {categoryPath !== "faq" && categoryPath !== "inquiry" && (
        <ErrorState message="유효하지 않은 페이지입니다." />
      )}
    </div>
  );
}
