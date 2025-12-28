"use client";

import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { Sidebar, type MenuItem } from "@/components/settings/Sidebar";
import { SubscriptionManagement } from "@/components/settings/SubscriptionManagement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeMenu, setActiveMenu] = useState<MenuItem>("profile");

  // 모달이 열릴 때 활성 포커스 제거 (접근성 경고 방지)
  useEffect(() => {
    if (open) {
      // 현재 포커스를 가진 요소의 포커스 제거
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 max-w-2xl overflow-hidden h-[700px] top-[50%] translate-y-[-50%]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">설정</DialogTitle>
        <DialogDescription className="sr-only">
          애플리케이션 설정을 관리합니다
        </DialogDescription>
        <div className="bg-background-1 grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-[1.1fr_3fr]">
          {/* Left Sidebar Navigation */}
          <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

          {/* Main Content Area */}
          <div className="border-l border-border overflow-y-auto max-h-[700px]">
            {activeMenu === "profile" && <ProfileSettings />}
            {activeMenu === "notifications" && <NotificationSettings />}
            {activeMenu === "subscription" && <SubscriptionManagement />}
            {activeMenu === "security" && <SecuritySettings />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
