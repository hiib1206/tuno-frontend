"use client";

import { cn } from "@/lib/utils";
import { getExchangeName } from "@/lib/stock";
import { useWatchlistStore } from "@/stores/watchlistStore";
import { ExchangeCode, WatchlistItem } from "@/types/Stock";
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
import { useEffect, useState } from "react";
import { toast } from "../ToastProvider";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/Skeleton";

// 드래그 가능한 아이템 컴포넌트
interface SortableItemProps {
  item: WatchlistItem;
  isDraggingActive: boolean;
  onSelect: (code: string, exchange: ExchangeCode) => void;
  onRemove: (item: WatchlistItem) => void;
}

function SortableItem({
  item,
  isDraggingActive,
  onSelect,
  onRemove,
}: SortableItemProps) {
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

  // 클릭 핸들러
  const handleClick = () => {
    if (!isDraggingActive && !isDragging) {
      onSelect(item.code, item.exchange);
    }
  };

  // 제거 핸들러
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(item);
  };

  return (
    <li ref={setNodeRef} style={style} >
      <div
        {...attributes}
        {...listeners}
        onClick={handleClick}
        className="flex items-center justify-between px-3 py-2 hover:bg-accent/10 transition-colors group cursor-grab active:cursor-grabbing"
      >
        <div className="flex-1 flex items-center justify-between min-w-0">
          <div className="flex flex-col space-y-1 flex-1 min-w-0">
            <span className="font-medium text-xs text-foreground truncate">
              {item.nameKo}
            </span>
            <div className="text-xs text-muted-foreground">
              {item.code} | {getExchangeName(item.exchange)}
            </div>
          </div>

          <div className="flex items-center ml-3">
            <span className="text-xs px-3 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
              {item.market === "KR" ? "국내" : "해외"}
            </span>
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
        </div>
      </div>
    </li>
  );
}

interface AnalysisWatchlistProps {
  className?: string;
  onSelect: (code: string, exchange: ExchangeCode) => void;
  showHeader?: boolean;
}

export function AnalysisWatchlist({
  className,
  onSelect,
  showHeader = true,
}: AnalysisWatchlistProps) {
  const {
    items,
    isLoading,
    error,
    updateOrderWithApi,
    removeAll,
    toggleWatchlist,
  } = useWatchlistStore();

  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 드래그 앤 드롭 센서 설정
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

  const handleDragStart = (event: DragStartEvent) => {
    setIsDraggingActive(true);
  };

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
      const success = await updateOrderWithApi(newItems);

      if (!success) {
        toast({
          description: "관심종목 순서 변경에 실패했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  // 관심종목 제거 핸들러
  const handleRemove = async (item: WatchlistItem) => {
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

  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <Skeleton variant="shimmer-contrast" className="flex-1 rounded-b-sm" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 헤더 */}
      {showHeader && (
        <div className="px-4 pt-2 pb-1 border-b border-border-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3 text-watchlist fill-watchlist" />
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
                  size="none"
                  className="!h-4 !text-xs !p-0"
                >
                  전체삭제
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 종목 리스트 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-xs text-muted-foreground">관심종목이 없습니다</p>
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
                    isDraggingActive={isDraggingActive}
                    onSelect={onSelect}
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
                isDraggingActive={false}
                onSelect={onSelect}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
