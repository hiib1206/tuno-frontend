"use client";

import { CommunityFooter } from "@/components/community/CommunityFooter";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CommunityNav } from "@/components/community/CommunityNav";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background-1">
      {/* 헤더 고정 */}
      <div className="bg-background-1 sticky top-0 z-50">
        <CommunityHeader />
        <CommunityNav />
      </div>
      <main className="bg-background-2 flex-1 mx-auto w-full py-6 sm:px-4">
        {children}
      </main>
      <CommunityFooter />
    </div>
  );
}
