"use client";

import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor, type EditorOptions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import EditorMenuBar from "./EditorMenuBar";
import { FontSize } from "./FontSizeExtension";
import { ResizableImageExtension } from "./ImageExtension";
import { YouTubeExtension } from "./YouTubeExtension";

export interface TiptapEditorProps {
  /**
   * 초기 콘텐츠 (HTML 문자열 또는 JSON 객체)
   */
  content?: string | object;
  /**
   * 에디터 내용이 변경될 때 호출되는 콜백
   */
  onUpdate?: (html: string, json: any) => void;
  /**
   * 에디터 클래스명 (내부 ProseMirror 요소에 적용)
   */
  className?: string;
  /**
   * 외부 컨테이너 클래스명 (기본값: "border border-border rounded shadow-sm bg-background-1 overflow-hidden flex flex-col")
   */
  containerClassName?: string;
  /**
   * 에디터 최소 높이 (기본값: "500px")
   */
  minHeight?: string;
  /**
   * 툴바 표시 여부 (기본값: true)
   */
  showToolbar?: boolean;
  /**
   * 에디터 옵션 커스터마이징
   */
  editorOptions?: Partial<EditorOptions>;
  /**
   * 에디터 인스턴스가 준비되었을 때 호출되는 콜백 (ref 대신 사용)
   */
  onEditorReady?: (editor: any) => void;
}

/**
 * TiptapEditor 컴포넌트
 * 재사용 가능한 Tiptap 에디터 컴포넌트입니다.
 *
 * 사용 예시:
 * ```tsx
 * <TiptapEditor
 *   content="<p>초기 내용</p>"
 *   onUpdate={(html, json) => console.log(html, json)}
 *   minHeight="300px"
 * />
 * ```
 */
export default function TiptapEditor({
  content = "",
  onUpdate,
  className = "",
  containerClassName,
  minHeight = "500px",
  showToolbar = true,
  editorOptions,
  onEditorReady,
}: TiptapEditorProps) {
  // 유튜브 URL에서 video ID를 추출하는 함수
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const editor = useEditor({
    // Extensions: 사용할 확장 기능 목록
    extensions: [
      StarterKit.configure({
        // starter-kit에 포함된 기본 확장에 대한 설정을 여기서 재정의할 수 있습니다.
        // 예: heading 레벨 제한 등
        // Link 확장을 비활성화 (아래에서 커스텀 Link 설정 사용)
        link: false,
      }),
      // TextStyle Extension: 인라인 스타일을 적용하기 위한 기본 extension
      // FontSize extension이 제대로 작동하려면 반드시 필요합니다.
      TextStyle,
      // FontSize Extension: 글자 크기를 제어하는 커스텀 extension
      FontSize,
      // Link Extension: 링크 기능
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      // ResizableImageExtension: 리사이즈 기능이 포함된 이미지 extension
      ResizableImageExtension,
      // YouTubeExtension: YouTube 영상 삽입 extension
      YouTubeExtension,
      // 추가 extension을 editorOptions로 전달할 수 있습니다.
      ...(editorOptions?.extensions || []),
    ],
    // Content: 초기 콘텐츠 설정 (HTML 문자열 또는 JSON 객체)
    content,
    // Editor Props: 에디터 렌더링 요소에 전달할 속성들
    editorProps: {
      attributes: {
        // Tailwind prose 플러그인을 사용하여 기본적인 타이포그래피 스타일 적용
        // focus:outline-none으로 기본 파란색 테두리 제거
        class: `prose prose-sm max-w-none focus:outline-none p-4 ${className}`,
        style: `line-height: 1.5; min-height: ${minHeight};`,
        // 브라우저 기본 맞춤법 검사 비활성화 (빨간 줄 제거)
        spellcheck: "false",
        ...editorOptions?.editorProps?.attributes,
      },
      // 엔터 키 입력 감지 및 스크롤 처리
      handleKeyDown: (view, event) => {
        // Enter 키 입력 감지
        if (event.key === "Enter") {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;

          // 마지막 블록인지 확인
          const isLastBlock = $from.parent === state.doc.lastChild;
          // 마지막 블록의 끝에 있는지 확인
          const isAtEndOfLastBlock =
            isLastBlock && $from.parentOffset >= $from.parent.content.size;

          if (isAtEndOfLastBlock) {
            // DOM 업데이트 후 스크롤 실행
            requestAnimationFrame(() => {
              // 에디터 컨테이너 찾기
              const editorElement = view.dom.closest(".ProseMirror");
              const scrollContainer =
                editorElement?.closest('[style*="overflow"]') ||
                document.documentElement;

              // 스크롤 가능한 컨테이너가 에디터 내부인지 확인
              if (
                scrollContainer &&
                scrollContainer !== document.documentElement
              ) {
                // 에디터 컨테이너 스크롤
                scrollContainer.scrollTo({
                  top: scrollContainer.scrollHeight,
                  behavior: "smooth",
                });
              } else {
                // 전체 페이지 스크롤
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: "smooth",
                });
              }
            });
          }
        }

        // 기존 handleKeyDown 핸들러가 있다면 실행
        return (
          editorOptions?.editorProps?.handleKeyDown?.(view, event) ?? false
        );
      },
      ...editorOptions?.editorProps,
    },
    // Update Event: 내용이 변경될 때 실행될 콜백
    onUpdate: (props) => {
      if (onUpdate) {
        const html = props.editor.getHTML();
        const json = props.editor.getJSON();
        onUpdate(html, json);
      }
      // editorOptions의 onUpdate도 호출
      editorOptions?.onUpdate?.(props);
    },
    // SSR 환경(Next.js)에서 하이드레이션 불일치 방지를 위해 false로 설정
    immediatelyRender: false,
    // 추가 옵션 병합 (onUpdate는 이미 위에서 처리했으므로 제외)
    ...(editorOptions
      ? Object.fromEntries(
          Object.entries(editorOptions).filter(([key]) => key !== "onUpdate")
        )
      : {}),
  });

  // 에디터 인스턴스가 준비되면 콜백 호출
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // 붙여넣기 이벤트 핸들러: 유튜브 URL 자동 변환
  useEffect(() => {
    if (!editor) return;

    const handlePaste = (event: ClipboardEvent) => {
      // 에디터가 포커스되어 있지 않으면 무시
      if (!editor.isFocused) return;

      // 클립보드에서 텍스트 가져오기
      const clipboardText = event.clipboardData?.getData("text/plain") || "";

      // 유튜브 URL인지 확인
      const videoId = getYouTubeVideoId(clipboardText.trim());

      if (videoId) {
        event.preventDefault();
        event.stopPropagation();

        // 유튜브 영상으로 변환
        (editor.chain().focus() as any)
          .setYouTubeVideo({
            src: clipboardText.trim(),
            videoId,
          })
          .run();
      }
    };

    // 에디터 DOM 요소에 paste 이벤트 리스너 추가
    const editorElement = editor.view.dom;
    editorElement.addEventListener("paste", handlePaste);

    return () => {
      editorElement.removeEventListener("paste", handlePaste);
    };
  }, [editor]);

  const defaultContainerClassName =
    "border border-t-0 border-border rounded-b shadow-sm bg-background-1 overflow-hidden flex flex-col";
  const finalContainerClassName =
    containerClassName ?? defaultContainerClassName;

  return (
    <div className="w-full">
      {/* 상단 툴바 컴포넌트 - 컨테이너 밖으로 분리하여 페이지 스크롤에 반응 */}
      {showToolbar && editor && <EditorMenuBar editor={editor} />}

      {/* 에디터 컨테이너 */}
      <div className={finalContainerClassName}>
        {/* 실제 에디터 영역 */}
        <div className="flex-1">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
