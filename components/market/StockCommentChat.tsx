"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { StockComment, StockCommentOpinion } from "@/types/StockComment";
import {
  ArrowUp,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── Props ────────────────────────────────────────────────────
interface StockCommentChatProps {
  comments: StockComment[];
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  onCreateComment: (
    content: string,
    opinion: StockCommentOpinion
  ) => Promise<void>;
  onUpdateComment: (
    id: string,
    body: { content?: string; opinion?: StockCommentOpinion }
  ) => Promise<void>;
  onDeleteComment: (id: string) => Promise<void>;
  onRefresh?: () => void;
  className?: string;
}

// ─── Opinion 관련 헬퍼 ──────────────────────────────────────────
const OPINION_CONFIG = {
  BUY: { label: "매수", className: "text-chart-up bg-chart-up/10" },
  SELL: { label: "매도", className: "text-chart-down bg-chart-down/10" },
  NEUTRAL: { label: "중립", className: "text-muted-foreground bg-muted" },
} as const;

const COMMENT_CLAMP_STYLE: React.CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 8,
  overflow: "hidden",
};

function OpinionBadge({ opinion }: { opinion: StockCommentOpinion }) {
  const { label, className } = OPINION_CONFIG[opinion];
  return (
    <span
      className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded",
        className
      )}
    >
      {label}
    </span>
  );
}

function OpinionSelector({
  value,
  onChange,
}: {
  value: StockCommentOpinion;
  onChange: (v: StockCommentOpinion) => void;
}) {
  const options: {
    value: StockCommentOpinion;
    label: string;
    activeClass: string;
  }[] = [
      { value: "BUY", label: "매수", activeClass: "text-chart-up bg-chart-up/10" },
      { value: "SELL", label: "매도", activeClass: "text-chart-down bg-chart-down/10" },
      {
        value: "NEUTRAL",
        label: "중립",
        activeClass: "text-muted-foreground bg-muted",
      },
    ];

  return (
    <div className="flex gap-0.5 shrink-0">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "text-[11px] px-1.5 py-1 rounded transition-colors",
            value === opt.value
              ? opt.activeClass
              : "text-muted-foreground/50 border-transparent hover:border-border"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export function StockCommentChat({
  comments,
  isLoading,
  error,
  isSubmitting,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onRefresh,
  className,
}: StockCommentChatProps) {
  const { user } = useAuthStore();

  // 탭
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

  // 입력
  const [newContent, setNewContent] = useState("");
  const [selectedOpinion, setSelectedOpinion] =
    useState<StockCommentOpinion>("NEUTRAL");

  // 수정
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editOpinion, setEditOpinion] =
    useState<StockCommentOpinion>("NEUTRAL");

  // 삭제
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 스크롤
  const messageListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);
  const contentRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set()
  );
  const [overflowMap, setOverflowMap] = useState<Record<string, boolean>>({});

  // ─── 필터링 ─────────────────────────────────────────────────
  const displayedComments = useMemo(() => {
    if (activeTab === "mine" && user) {
      return comments.filter((c) => c.author.id === user.id);
    }
    return comments;
  }, [comments, activeTab, user]);

  useEffect(() => {
    const checkOverflow = () => {
      const map: Record<string, boolean> = {};
      displayedComments.forEach((comment) => {
        const el = contentRefs.current[comment.id];
        if (!el) return;
        map[comment.id] = el.scrollHeight > el.clientHeight + 1;
      });
      setOverflowMap(map);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [displayedComments, expandedIds]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ─── 스크롤 핸들링 ──────────────────────────────────────────
  const handleScroll = () => {
    if (!messageListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  // 댓글 변경 시 auto-scroll (near bottom일 때만)
  useEffect(() => {
    if (isNearBottomRef.current && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [displayedComments]);

  // 초기 로딩 완료 시 맨 아래로
  useEffect(() => {
    if (!isLoading && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [isLoading]);

  // ─── 댓글 작성 ──────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || isSubmitting) return;
    await onCreateComment(newContent.trim(), selectedOpinion);
    setNewContent("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  // ─── 수정 ────────────────────────────────────────────────────
  const handleStartEdit = (comment: StockComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setEditOpinion(comment.opinion);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim() || isSubmitting) return;
    await onUpdateComment(editingId, {
      content: editContent.trim(),
      opinion: editOpinion,
    });
    setEditingId(null);
    setEditContent("");
  };

  // ─── 삭제 ────────────────────────────────────────────────────
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    await onDeleteComment(deleteTargetId);
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  // ─── 렌더 ────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "flex flex-col bg-background-1 rounded-md overflow-hidden",
        className
      )}
    >
      {/* 탭 헤더 */}
      <div className="flex items-center border-b border-border-2 shrink-0">
        {(["all", "mine"] as const).map((tab) => {
          const disabled = tab === "mine" && !user;
          return (
            <button
              key={tab}
              onClick={() => !disabled && setActiveTab(tab)}
              disabled={disabled}
              className={cn(
                "flex-1 py-3 text-xs font-medium transition-colors",
                disabled
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : activeTab === tab
                    ? "text-accent border-b-2 border-accent -mb-px"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "all" ? "종목 토론" : "내 댓글"}
            </button>
          );
        })}
        {onRefresh && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onRefresh}
                  className="px-2 py-2 mr-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>새로고침</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* 메시지 목록 */}
      <div
        ref={messageListRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0"
      >
        <div className="p-3 min-h-full flex flex-col">
          {/* 내 댓글 탭 안내 문구 */}
          {activeTab === "mine" && !isLoading && !error && (
            <div className="flex justify-center mb-3 shrink-0">
              <span className="text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full">
                최근 작성한 댓글만 표시됩니다
              </span>
            </div>
          )}

          {/* 로딩 */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 에러 */}
          {!isLoading && error && (
            <div className="flex-1 flex flex-col items-center justify-end text-muted-foreground p-6">
              <p className="text-sm">{error}</p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="text-xs text-accent mt-2 hover:underline"
                >
                  다시 시도
                </button>
              )}
            </div>
          )}

          {/* 빈 상태 */}
          {!isLoading && !error && displayedComments.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-end text-muted-foreground p-6">
              <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">
                {activeTab === "mine"
                  ? "작성한 댓글이 없습니다."
                  : "아직 댓글이 없습니다."}
              </p>
              {activeTab === "all" && (
                <p className="text-xs mt-1">첫 번째 의견을 남겨보세요!</p>
              )}
            </div>
          )}

          {/* 메시지 목록 */}
          {!isLoading &&
            !error &&
            displayedComments.map((comment) => {
              const isExpanded = expandedIds.has(comment.id);
              const isOverflow = overflowMap[comment.id];
              return (
                <div
                  key={comment.id}
                  className={cn(
                    "flex items-start gap-2 group p-1.5 -mx-1.5 relative",
                    activeTab === "all" && user && user.id === comment.author.id && "bg-background-3"
                  )}
                >
                  {/* 아바타 */}
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage
                      src={comment.author.profileImageUrl || undefined}
                      alt={comment.author.nick}
                    />
                    <AvatarFallback className="text-xs">
                      {comment.author.nick?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* 닉네임 + 시간 + 뱃지 */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground truncate max-w-[80px]">
                        {comment.author.nick}
                      </span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                      <OpinionBadge opinion={comment.opinion} />
                    </div>

                    {/* 내용 또는 수정 모드 */}
                    {editingId === comment.id ? (
                      <div className="mt-1 space-y-1.5">
                        <OpinionSelector
                          value={editOpinion}
                          onChange={setEditOpinion}
                        />
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[36px] max-h-[100px] text-sm"
                          maxLength={1000}
                          rows={3}
                        />
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="xxs"
                            onClick={handleCancelEdit}
                          >
                            취소
                          </Button>
                          <Button
                            variant="accent"
                            size="xxs"
                            onClick={handleSaveEdit}
                            disabled={!editContent.trim() || isSubmitting}
                          >
                            저장
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p
                          ref={(el) => {
                            contentRefs.current[comment.id] = el;
                          }}
                          className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words"
                          style={isExpanded ? undefined : COMMENT_CLAMP_STYLE}
                        >
                          {comment.content}
                        </p>
                        {(isExpanded || isOverflow) && (
                          <button
                            type="button"
                            onClick={() => handleToggleExpand(comment.id)}
                            className="text-xs text-accent mt-1 hover:underline"
                          >
                            {isExpanded ? "접기" : "더보기"}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* 수정/삭제 (본인 댓글, hover 시) */}
                  {user &&
                    user.id === comment.author.id &&
                    editingId !== comment.id && (
                      <div className={cn(
                        "absolute top-1.5 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded px-2 py-0.5",
                      )}>
                        <button
                          onClick={() => handleStartEdit(comment)}
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                          수정
                        </button>
                        <span className="text-[10px] text-muted-foreground/30">|</span>
                        <button
                          onClick={() => handleDeleteClick(comment.id)}
                          className="text-[10px] text-muted-foreground hover:text-destructive transition-colors font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                </div>
              );
            })}
        </div>
      </div>

      {/* 입력 영역 */}
      {activeTab === "all" && (
        <div className="border-t border-border-2 p-3 pt-1.5 shrink-0">
          {user ? (
            <form onSubmit={handleSubmit}>
              <OpinionSelector
                value={selectedOpinion}
                onChange={setSelectedOpinion}
              />
              <div className="flex items-end gap-2 mt-1.5">
                <Textarea
                  ref={inputRef}
                  placeholder="의견을 입력하세요..."
                  value={newContent}
                  onChange={(e) => {
                    setNewContent(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                    requestAnimationFrame(() => {
                      if (messageListRef.current) {
                        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
                      }
                    });
                  }}
                  className="min-h-[36px] max-h-[100px] text-sm flex-1 overflow-y-auto"
                  maxLength={1000}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="default-accent"
                  size="none"
                  disabled={!newContent.trim() || isSubmitting}
                  className="p-2"
                >
                  <ArrowUp className="!h-5 !w-5" />
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-center py-2 text-sm text-muted-foreground">
              댓글을 작성하려면 로그인이 필요합니다.
            </p>
          )}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="댓글 삭제"
        description="정말로 이 댓글을 삭제하시겠습니까?"
        onConfirm={handleDeleteConfirm}
        isProcessing={isDeleting}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
      />
    </div>
  );
}
