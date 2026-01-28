"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  price: number;
  onConfirm: (newPrice: number) => void;
  onClose: () => void;
}

export function HorizontalLineEditPopover({
  price,
  onConfirm,
  onClose,
}: Props) {
  const [inputValue, setInputValue] = useState(Math.round(price).toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // 마운트 시 input 포커스 및 전체 선택
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleConfirm = () => {
    const newPrice = Math.round(parseFloat(inputValue.replace(/,/g, "")));
    if (!isNaN(newPrice) && newPrice > 0) {
      onConfirm(newPrice);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
  };

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background-1 border border-border rounded-sm shadow-md min-w-[200px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-border">
        <span className="text-xs font-medium text-foreground">수평선 편집</span>
        <Button variant="ghost" size="icon-xs" onClick={onClose}>
          <X className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      {/* 입력 필드 */}
      <div className="p-3">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-1 text-xs bg-background border border-border rounded focus:ring-0"
          placeholder="가격 입력"
        />
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-center items-center gap-2 px-3 pb-3">
        <Button variant="accent" size="xs" onClick={handleConfirm} className="text-xs">
          확인
        </Button>
        <Button variant="default" size="xs" onClick={onClose} className="text-xs">
          취소
        </Button>
      </div>
    </div>
  );
}
