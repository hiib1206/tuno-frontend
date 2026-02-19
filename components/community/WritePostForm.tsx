"use client";

import TiptapEditor from "@/components/editor/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/useToast";
import { PostCategory, PostCategoryLabels } from "@/types/Common";
import type { Editor } from "@tiptap/react";
import { Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface WritePostFormProps {
  pageTitle?: string;
  onCancel?: () => void;
  onSubmit: (data: {
    title: string;
    category: PostCategory;
    content: string;
    imageFiles?: File[];
    blobUrlToIndex?: Map<string, number>;
  }) => Promise<void>;
  initialData?: {
    title: string;
    category: PostCategory;
    content: any; // JSON 객체
  };
}

export function WritePostForm({
  pageTitle = "글쓰기",
  onCancel,
  onSubmit,
  initialData,
}: WritePostFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState<PostCategory | undefined>(
    initialData?.category || undefined
  );
  const [contentJson, setContentJson] = useState<any>(
    initialData?.content || null
  ); // JSON 객체로 저장 (성능 최적화)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // SSR에서는 null로 시작하여 hydration mismatch 방지
  const [isSmallScreen, setIsSmallScreen] = useState<boolean | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    setIsSmallScreen(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsSmallScreen(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleContentUpdate = (html: string, json: any) => {
    // JSON 객체로만 저장 (문자열 변환은 제출 시에만 수행)
    setContentJson(json);
  };

  const handleEditorReady = (editor: Editor) => {
    editorRef.current = editor;
    // 초기 데이터가 있고 에디터가 아직 초기화되지 않았다면 설정
    if (initialData?.content && !isEditorInitialized) {
      editor.commands.setContent(initialData.content);
      setIsEditorInitialized(true);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "제목을 입력해주세요.",
      });
      return;
    }

    if (!category) {
      toast({
        variant: "destructive",
        title: "카테고리를 선택해주세요.",
      });
      return;
    }

    // JSON 객체로 직접 빈 내용 체크
    if (
      !contentJson ||
      !contentJson.content ||
      contentJson.content.length === 0
    ) {
      toast({
        variant: "destructive",
        title: "내용을 입력해주세요.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const editor = editorRef.current;
      if (!editor) {
        throw new Error("에디터가 준비되지 않았습니다.");
      }

      // 에디터에서 이미지 파일 Map 가져오기
      const imageFileMap = (editor as any).getImageFiles?.() as
        | Map<string, File>
        | undefined;

      let finalContent = contentJson;

      // Blob URL이 있는 경우 처리
      const imageFiles: File[] = [];
      const blobUrlToIndex = new Map<string, number>();

      if (imageFileMap && imageFileMap.size > 0) {
        const html = editor.getHTML();
        const blobUrlPattern = /blob:[^"'\s]+/g;
        const blobUrls = html.match(blobUrlPattern) || [];

        if (blobUrls.length > 0) {
          // 각 Blob URL에 대해 File 객체 수집 및 인덱스 매핑
          for (const blobUrl of blobUrls) {
            const file = imageFileMap.get(blobUrl);
            if (file) {
              const index = imageFiles.length;
              imageFiles.push(file);
              blobUrlToIndex.set(blobUrl, index);
            }
          }
        }
      }

      // 항상 FormData로 전송 (이미지가 없어도 빈 배열 전송)
      // content는 JSON 객체 그대로 전달 (API 레이어에서 문자열로 변환)
      await onSubmit({
        title,
        category,
        content: finalContent,
        imageFiles,
        blobUrlToIndex,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "게시글 저장에 실패했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg w-full py-4 px-4 md:px-6 bg-background-1">
      {/* 헤더 */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-4 border-b border-border-2 pb-2">
        <h1 className="text-xl sm:text-2xl font-semibold">{pageTitle}</h1>
        <Button
          variant="accent"
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !category}
          className="shrink-0 gap-1"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "등록 중..." : "등록"}
        </Button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* 카테고리 선택 */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm sm:text-base">
            카테고리
          </Label>
          <Select
            value={category || ""}
            onValueChange={(value) => setCategory(value as PostCategory)}
          >
            <SelectTrigger id="category" className="w-full rounded text-sm">
              <SelectValue placeholder="카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent className="rounded">
              {Object.values(PostCategory).map((cat) => (
                <SelectItem key={cat} value={cat} className="hover:rounded">
                  {PostCategoryLabels[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 제목 입력 */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm sm:text-base">
            제목
          </Label>
          <Input
            id="title"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm"
          />
        </div>

        {/* 본문 에디터 */}
        <div className="space-y-2">
          <Label className="text-sm sm:text-base">내용</Label>
          <TiptapEditor
            content={initialData?.content || ""}
            onUpdate={handleContentUpdate}
            onEditorReady={handleEditorReady}
            minHeight={isSmallScreen !== false ? "300px" : "400px"}
          />
        </div>
      </div>
    </div>
  );
}
