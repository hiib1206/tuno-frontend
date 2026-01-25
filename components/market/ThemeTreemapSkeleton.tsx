export function ThemeTreemapSkeleton() {
  return (
    <div className="h-full w-full p-4 bg-background-1 rounded-md flex flex-col">
      {/* 헤더 스켈레톤 */}
      <div className="flex justify-between items-center mb-2">
        <div className="h-6 w-24 skeleton-gradient-loading rounded" />
        <div className="w-8 h-8 skeleton-gradient-loading rounded-md" />
      </div>

      {/* 트리맵 스켈레톤 */}
      <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-1">
        {/* 큰 블록들 - 상위 테마 */}
        <div className="col-span-4 row-span-3 skeleton-gradient-loading rounded" />
        <div className="col-span-3 row-span-2 skeleton-gradient-loading rounded" />
        <div className="col-span-5 row-span-2 skeleton-gradient-loading rounded" />

        {/* 중간 블록들 */}
        <div className="col-span-3 row-span-2 skeleton-gradient-loading rounded" />
        <div className="col-span-2 row-span-2 skeleton-gradient-loading rounded" />
        <div className="col-span-3 row-span-2 skeleton-gradient-loading rounded" />

        {/* 하단 블록들 */}
        <div className="col-span-4 row-span-3 skeleton-gradient-loading rounded" />
        <div className="col-span-2 row-span-2 skeleton-gradient-loading rounded" />
        <div className="col-span-2 row-span-2 skeleton-gradient-loading rounded" />
        <div className="col-span-2 row-span-2 skeleton-gradient-loading rounded" />
        <div className="col-span-2 row-span-2 skeleton-gradient-loading rounded" />
        {/* 작은 블록들 - 오른쪽 끝 */}
        <div className="col-span-2 row-span-1 skeleton-gradient-loading rounded" />
        <div className="col-span-2 row-span-1 skeleton-gradient-loading rounded" />
      </div>
    </div>
  );
}
