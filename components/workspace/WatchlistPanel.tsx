"use client";

import { cn } from "@/lib/utils";
import { getExchangeName } from "@/lib/stock";
import { useWatchlistStore } from "@/stores/watchlistStore";
import { WatchlistItem } from "@/types/Stock";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "../ToastProvider";
import { Button } from "../ui/button";

// 드래그 가능한 아이템 컴포넌트
interface SortableItemProps {
  item: WatchlistItem;
  getStockUrl: (item: WatchlistItem) => string;
  onRemove?: (item: WatchlistItem) => void;
}

function SortableItem({ item, getStockUrl, isDraggingActive, onRemove }: SortableItemProps & { isDraggingActive: boolean }) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${item.exchange}-${item.code}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 클릭 핸들러 (드래그가 아닐 때만 네비게이션)
  const handleClick = (e: React.MouseEvent) => {
    // 드래그가 활성화되지 않았을 때만 네비게이션
    if (!isDraggingActive && !isDragging) {
      router.push(getStockUrl(item));
    }
  };

  // 제거 핸들러
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모의 onClick 이벤트 방지
    if (onRemove) {
      onRemove(item);
    }
  };

  return (
    <li ref={setNodeRef} style={style} className="border-b border-border-2 last:border-b-0">
      <div
        {...attributes}
        {...listeners}
        onClick={handleClick}
        className="flex items-center justify-between px-4 py-3 hover:bg-accent/10 transition-colors group cursor-grab active:cursor-grabbing"
      >
        {/* 종목 정보 */}
        <div className="flex-1 flex items-center justify-between min-w-0">
          <div className="flex flex-col space-y-1 flex-1 min-w-0">
            <span className="font-medium text-sm text-foreground truncate">
              {item.nameKo}
            </span>
            <div className="text-xs text-muted-foreground">
              {item.code} | {getExchangeName(item.exchange)}
            </div>
          </div>

          <div className="flex items-center ml-3">
            <span className="text-xs px-3 py-0.5 rounded-full bg-accent/10 text-accent shrink-0">
              {item.market === "KR" ? "국내" : "해외"}
            </span>
            {onRemove && (
              <div className="max-w-0 overflow-hidden group-hover:max-w-[24px] transition-all duration-150">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={handleRemove}
                  className="py-3 pl-3 rounded-full text-muted-foreground hover:text-foreground hover:scale-120 cursor-pointer shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

interface WatchlistPanelProps {
  className?: string;
}

export function WatchlistPanel({ className }: WatchlistPanelProps) {
  // 전역 스토어 사용
  const { items, isLoading, error, updateOrderWithApi, removeAll, toggleWatchlist } = useWatchlistStore();
  
  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트에서만 마운트된 후 드래그 앤 드롭 활성화 (hydration mismatch 방지)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 드래그 앤 드롭 센서 설정
  // activationConstraint: 5px 이상 이동해야 드래그 시작 (클릭과 구분)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 시작 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    setIsDraggingActive(true);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDraggingActive(false);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(
        (item) => `${item.exchange}-${item.code}` === active.id
      );
      const newIndex = items.findIndex(
        (item) => `${item.exchange}-${item.code}` === over.id
      );

      const newItems = arrayMove(items, oldIndex, newIndex);

      // 스토어를 통해 순서 변경 (낙관적 업데이트 + API 호출)
      const success = await updateOrderWithApi(newItems);

      if (!success) {
        toast({
          description: "관심종목 순서 변경에 실패했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  // 종목 상세 페이지 URL 생성
  const getStockUrl = (item: WatchlistItem) => {
    return `/market/stock/${item.code}?exchange=${item.exchange}&market=${item.market}`;
  };

  // 관심종목 제거 핸들러
  const handleRemove = async (item: WatchlistItem) => {
    // 스토어를 통해 토글 (제거)
    await toggleWatchlist(item.code, item.exchange);
  };

  // 전체 삭제 핸들러
  const handleRemoveAll = async () => {
    const success = await removeAll();
    if (!success) {
      toast({
        description: "관심종목 전체 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-watchlist fill-watchlist" />
            <span className="font-semibold text-sm">관심종목</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {items.length}종목
            </span>
            {items.length > 0 && (
              <Button
                variant="default-destructive"
                onClick={handleRemoveAll}
                size="xs"
                className="h-6 text-xs !p-0"
              >
                전체삭제
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 종목 리스트 */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-b-md">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-sm text-muted-foreground">관심종목이 없습니다</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              종목 페이지에서 ★ 버튼을 눌러 추가하세요
            </p>
          </div>
        ) : isMounted ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => `${item.exchange}-${item.code}`)}
              strategy={verticalListSortingStrategy}
            >
              <ul>
                {items.map((item) => (
                  <SortableItem
                    key={`${item.exchange}-${item.code}`}
                    item={item}
                    getStockUrl={getStockUrl}
                    isDraggingActive={isDraggingActive}
                    onRemove={handleRemove}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <ul>
            {items.map((item) => (
              <SortableItem
                key={`${item.exchange}-${item.code}`}
                item={item}
                getStockUrl={getStockUrl}
                isDraggingActive={false}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
