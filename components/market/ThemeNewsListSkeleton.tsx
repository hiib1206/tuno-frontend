import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ThemeNewsListSkeleton() {
  return (
    <Card variant="workspace" className="h-full min-h-0 relative">
      <CardHeader>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-6 w-24 skeleton-gradient-loading rounded" />
        </div>
      </CardHeader>
      <CardContent className="relative overflow-y-auto h-[500px] md:h-full">
        <div className="h-full skeleton-gradient-loading rounded-lg" />
      </CardContent>
    </Card>
  );
}
