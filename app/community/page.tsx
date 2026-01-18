"use client";

import { CommunityNewsShowcase } from "@/components/community/CommunityNewsShowcase";
import { CommunityPostList } from "@/components/community/CommunityPostList";

export default function CommunityPage() {
  return (
    <div className="space-y-2 max-w-4xl mx-auto">
      <CommunityNewsShowcase />
      <CommunityPostList />
    </div>
  );
}
