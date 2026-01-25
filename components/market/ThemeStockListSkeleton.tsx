export function ThemeStockListSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background-1 rounded-md overflow-hidden">
      {/* 헤더 스켈레톤 */}
      <div className="pt-4 px-4 pb-1">
        <div className="h-6 w-28 skeleton-gradient-loading rounded mb-4" />
        <div className="flex gap-2 justify-end">
          <div className="h-4 w-32 skeleton-gradient-loading rounded" />
        </div>
      </div>

      {/* 리스트 스켈레톤 */}
      <div className="flex-1 m-3 skeleton-gradient-loading rounded-lg" />
    </div>
  );
}
