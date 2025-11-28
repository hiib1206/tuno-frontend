"use client";

import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { Sidebar, type MenuItem } from "@/components/settings/Sidebar";
import { SubscriptionManagement } from "@/components/settings/SubscriptionManagement";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeMenu, setActiveMenu] = useState<MenuItem>("profile");
  const { me } = useAuthStore();

  useEffect(() => {
    if (open) {
      me();
    }
  }, [open, me]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden h-[700px] top-[50%] translate-y-[-50%]">
        <DialogTitle className="sr-only">설정</DialogTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-[1fr_3fr] bg-background-sidebar">
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
