"use client";

import { useCallback, useEffect, useState } from "react";
import stockCommentApi from "@/api/stockCommentApi";
import { toast } from "@/components/ToastProvider";
import { StockComment, StockCommentOpinion } from "@/types/StockComment";

export function useStockComments(ticker: string, exchange: string) {
  const [comments, setComments] = useState<StockComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(
    async (silent = false) => {
      if (!ticker) return;
      try {
        if (!silent) setIsLoading(true);
        setError(null);
        const response = await stockCommentApi.getComments(ticker, {
          limit: 100,
          order: "desc",
        });
        if (response.success) {
          // desc로 최근 100개를 받아서 reverse → 오래된순(위) → 최신(아래)
          setComments([...response.data.list].reverse());
        } else {
          setError("댓글을 불러오는데 실패했습니다.");
        }
      } catch {
        setError("댓글을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [ticker]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const createComment = useCallback(
    async (content: string, opinion: StockCommentOpinion) => {
      if (!content.trim()) return;
      setIsSubmitting(true);
      try {
        const response = await stockCommentApi.createComment({
          ticker,
          exchange,
          content,
          opinion,
        });
        if (response.success) {
          setComments((prev) => {
            const next = [...prev, response.data];
            // 100개 초과 시 가장 오래된 것 제거
            if (next.length > 100) next.shift();
            return next;
          });
        } else {
          toast({
            variant: "destructive",
            description: "댓글 작성에 실패했습니다.",
          });
        }
      } catch {
        toast({
          variant: "destructive",
          description: "댓글 작성에 실패했습니다.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [ticker, exchange]
  );

  const updateComment = useCallback(
    async (
      id: string,
      body: { content?: string; opinion?: StockCommentOpinion }
    ) => {
      setIsSubmitting(true);
      try {
        const response = await stockCommentApi.updateComment(id, body);
        if (response.success) {
          setComments((prev) =>
            prev.map((c) => (c.id === id ? response.data : c))
          );
        } else {
          toast({
            variant: "destructive",
            description: "댓글 수정에 실패했습니다.",
          });
        }
      } catch {
        toast({
          variant: "destructive",
          description: "댓글 수정에 실패했습니다.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const deleteComment = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await stockCommentApi.deleteComment(id);
      if (response.success) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast({
          variant: "destructive",
          description: "댓글 삭제에 실패했습니다.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        description: "댓글 삭제에 실패했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    comments,
    isLoading,
    error,
    isSubmitting,
    createComment,
    updateComment,
    deleteComment,
    refreshComments: () => fetchComments(true),
  };
}
