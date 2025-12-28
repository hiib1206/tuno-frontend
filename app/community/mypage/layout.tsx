"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth();
  return <div className="w-full">{children}</div>;
}
