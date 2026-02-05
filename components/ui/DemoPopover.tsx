"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DemoPopover({ children }: { children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto max-w-68 px-3 py-2 text-xs text-slate-500 text-center">
        데모 프로젝트로, 실제 기능은 제공되지 않습니다.
      </PopoverContent>
    </Popover>
  );
}
