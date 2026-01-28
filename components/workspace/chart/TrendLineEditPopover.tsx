"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  startPrice: number;
  endPrice: number;
  onConfirm: (startPrice: number, endPrice: number) => void;
  onClose: () => void;
}

export function TrendLineEditPopover({
  startPrice,
  endPrice,
  onConfirm,
  onClose,
}: Props) {
  const [startValue, setStartValue] = useState(Math.round(startPrice).toString());
  const [endValue, setEndValue] = useState(Math.round(endPrice).toString());
  const startInputRef = useRef<HTMLInputElement>(null);

  // 마운트 시 첫 번째 input 포커스 및 전체 선택
  useEffect(() => {
    startInputRef.current?.focus();
    startInputRef.current?.select();
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
    const newStartPrice = Math.round(parseFloat(startValue.replace(/,/g, "")));
    const newEndPrice = Math.round(parseFloat(endValue.replace(/,/g, "")));
    if (!isNaN(newStartPrice) && newStartPrice > 0 && !isNaN(newEndPrice) && newEndPrice > 0) {
      onConfirm(newStartPrice, newEndPrice);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
  };

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background-1 border border-border rounded-sm shadow-md min-w-[220px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-border">
        <span className="text-xs font-medium text-foreground">추세선 편집</span>
        <Button variant="ghost" size="icon-xs" onClick={onClose}>
          <X className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      {/* 입력 필드 */}
      <div className="p-3 space-y-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">시작가</label>
          <input
            ref={startInputRef}
            type="text"
            value={startValue}
            onChange={(e) => setStartValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-1 text-xs bg-background border border-border rounded focus:ring-0"
            placeholder="시작 가격"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">끝가</label>
          <input
            type="text"
            value={endValue}
            onChange={(e) => setEndValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-1 text-xs bg-background border border-border rounded focus:ring-0"
            placeholder="끝 가격"
          />
        </div>
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
