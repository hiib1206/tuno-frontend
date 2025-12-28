"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

interface InquiryComponentProps {
  title?: string;
}

export default function InquiryComponent({
  title = "문의하기",
}: InquiryComponentProps) {
  const [formData, setFormData] = useState({
    category: "",
    email: "",
    title: "",
    content: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 기능 구현 없음 - 개인 프로젝트
  };

  return (
    <div
      className={cn(
        "rounded-lg max-w-4xl mx-auto py-4 px-4 md:px-6 bg-background-1"
      )}
    >
      {/* 제목 섹션 */}
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-accent-text" />
        <h2 className="px-1 text-lg sm:text-xl font-semibold">{title}</h2>
      </div>

      {/* 문의 폼 */}
      <div>
        <div className="h-px border-t border-border/60" />
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="space-y-2 px-2">
            <Label htmlFor="category" className="text-sm font-medium">
              문의 유형
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger id="category" className="rounded">
                <SelectValue placeholder="문의 유형을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="rounded [&_[data-slot=select-item]]:hover:bg-transparent [&_[data-slot=select-item]]:hover:text-accent-text">
                <SelectItem value="service">서비스 이용</SelectItem>
                <SelectItem value="account">계정 관련</SelectItem>
                <SelectItem value="payment">결제/환불</SelectItem>
                <SelectItem value="bug">버그 신고</SelectItem>
                <SelectItem value="suggestion">기능 제안</SelectItem>
                <SelectItem value="etc">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 px-2">
            <Label htmlFor="email" className="text-sm font-medium">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="답변을 받을 이메일을 입력하세요"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2 px-2">
            <Label htmlFor="title" className="text-sm font-medium">
              제목
            </Label>
            <Input
              id="title"
              placeholder="문의 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="space-y-2 px-2">
            <Label htmlFor="content" className="text-sm font-medium">
              내용
            </Label>
            <Textarea
              id="content"
              placeholder="문의 내용을 상세히 입력해주세요"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="px-2 pt-2">
            <Button type="submit" className="w-full" variant="accent">
              문의하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
