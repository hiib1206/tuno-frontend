"use client";

import { Header } from "@/components/header";
import { Dashboard } from "@/components/mypage/Dashboard";
import { Favorites } from "@/components/mypage/Favorites";
import { NotificationSettings } from "@/components/mypage/NotificationSettings";
import { PredictionHistory } from "@/components/mypage/PredictionHistory";
import { ProfileSettings } from "@/components/mypage/ProfileSettings";
import { SecuritySettings } from "@/components/mypage/SecuritySettings";
import { Sidebar, type MenuItem } from "@/components/mypage/Sidebar";
import { SubscriptionManagement } from "@/components/mypage/SubscriptionManagement";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";

export default function MyPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>("profile");
  const { me } = useAuthStore();

  useEffect(() => {
    me();
  }, [me]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">마이페이지</h1>
          <p className="text-muted-foreground">계정 정보와 설정을 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4">
            {activeMenu === "profile" && <ProfileSettings />}
            {activeMenu === "dashboard" && <Dashboard />}
            {activeMenu === "history" && <PredictionHistory />}
            {activeMenu === "favorites" && <Favorites />}
            {activeMenu === "notifications" && <NotificationSettings />}
            {activeMenu === "subscription" && <SubscriptionManagement />}
            {activeMenu === "security" && <SecuritySettings />}
          </div>
        </div>
      </main>
    </div>
  );
}
