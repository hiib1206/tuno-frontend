"use client";

import { toast } from "@/hooks/useToast";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  ChevronDown,
  Image as ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Type,
  Youtube,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

/**
 * MenuBar 컴포넌트
 * 에디터의 툴바 역할을 합니다. editor 인스턴스를 prop으로 받아서
 * 현재 선택된 텍스트의 스타일을 확인(isActive)하거나 스타일을 적용(toggle...)합니다.
 */
export default function EditorMenuBar({ editor }: { editor: Editor }) {
  // 드롭다운 토글 상태 관리
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const [isYouTubeDialogOpen, setIsYouTubeDialogOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fontSizeDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const youtubeInputRef = useRef<HTMLInputElement>(null);
  const linkUrlInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // 에디터 상태 변경 감지를 위한 state (버튼 활성화 상태를 즉시 업데이트하기 위함)
  const [, forceUpdate] = useState({});

  // 툴바 sticky top 위치 계산 (헤더+네비 높이)
  const [stickyTop, setStickyTop] = useState(0);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fontSizeDropdownRef.current &&
        !fontSizeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFontSizeOpen(false);
      }
      // YouTube 다이얼로그 외부 클릭 감지
      const target = event.target as HTMLElement;
      if (
        isYouTubeDialogOpen &&
        !target.closest("[data-youtube-dialog]") &&
        !target.closest('button[title="Insert YouTube Video"]')
      ) {
        setIsYouTubeDialogOpen(false);
        setYoutubeUrl("");
      }
      // 링크 다이얼로그 외부 클릭 감지
      if (
        isLinkDialogOpen &&
        !target.closest("[data-link-dialog]") &&
        !target.closest('button[title="Insert Link"]')
      ) {
        setIsLinkDialogOpen(false);
        setLinkUrl("");
        setLinkText("");
      }
    };

    if (isFontSizeOpen || isYouTubeDialogOpen || isLinkDialogOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFontSizeOpen, isYouTubeDialogOpen, isLinkDialogOpen]);

  // 헤더+네비 높이 계산 (툴바 sticky 위치 결정)
  useEffect(() => {
    const calculateStickyTop = () => {
      // sticky top-0 z-50인 요소 찾기 (헤더+네비 컨테이너)
      // layout.tsx에서 <div className="bg-background-1 sticky top-0 z-50">로 감싸져 있음
      const headerContainer = document.querySelector(
        '.sticky.top-0.z-50, [class*="sticky"][class*="top-0"][class*="z-50"]'
      ) as HTMLElement;

      if (headerContainer) {
        const height = headerContainer.getBoundingClientRect().height;
        setStickyTop(height);
      } else {
        // fallback: 대략적인 높이 (헤더 80px + 네비 약 40px)
        setStickyTop(120);
      }
    };

    // 초기 계산
    calculateStickyTop();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", calculateStickyTop);

    // MutationObserver로 DOM 변화 감지 (헤더/네비 높이 변경 시)
    const observer = new MutationObserver(calculateStickyTop);
    const headerContainer = document.querySelector(
      '.sticky.top-0.z-50, [class*="sticky"][class*="top-0"][class*="z-50"]'
    );
    if (headerContainer) {
      observer.observe(headerContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style"],
      });
    }

    return () => {
      window.removeEventListener("resize", calculateStickyTop);
      observer.disconnect();
    };
  }, []);

  // 에디터 상태 변경 감지 (버튼 활성화 상태를 즉시 업데이트)
  useEffect(() => {
    const handleUpdate = () => {
      forceUpdate({});
    };

    editor.on("selectionUpdate", handleUpdate);
    editor.on("transaction", handleUpdate);
    editor.on("update", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("transaction", handleUpdate);
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  // 버튼 스타일 유틸리티 함수
  // isActive: 현재 포커스된 텍스트에 해당 스타일이 적용되어 있는지 여부
  const getButtonClass = (isActive: boolean) => {
    return `p-2 rounded hover:bg-muted-3 hover:text-accent-text transition-colors ${
      isActive ? "bg-muted-3 text-accent-text" : "text-muted-foreground"
    }`;
  };

  // 글자 크기 옵션 목록
  // 사용자가 선택할 수 있는 글자 크기들을 정의합니다.
  const fontSizes = [
    { label: "11px", value: "11" },
    { label: "13px", value: "13" },
    { label: "15px", value: "15" }, // 기본 크기
    { label: "16px", value: "16" },
    { label: "19px", value: "19" },
    { label: "24px", value: "24" },
    { label: "28px", value: "28" },
    { label: "30px", value: "30" },
    { label: "34px", value: "34" },
    { label: "38px", value: "38" },
  ];

  // 현재 선택된 텍스트의 글자 크기를 가져오는 함수
  // editor.getAttributes("textStyle").fontSize로 현재 적용된 글자 크기를 확인합니다.
  // 글자 크기가 설정되지 않았으면 기본값 "15"을 반환합니다.
  const getCurrentFontSize = () => {
    const fontSize = editor.getAttributes("textStyle").fontSize;
    return fontSize || "15"; // 기본값
  };

  // 이미지 파일 선택 핸들러
  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  // 이미지 크기 읽기 유틸리티
  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        // 기본 크기 반환
        resolve({ width: 400, height: 300 });
      };

      img.src = url;
    });
  };

  // 파일 검증
  const validateImageFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "이미지 파일만 업로드 가능합니다.";
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "이미지 크기는 10MB 이하여야 합니다.";
    }

    return null;
  };

  // Blob URL과 File 객체를 매핑하는 Map (메모리 관리용)
  const imageFileMapRef = useRef<Map<string, File>>(new Map());

  // 이미지 파일 업로드 핸들러
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 검증
    const validationError = validateImageFile(file);
    if (validationError) {
      toast({
        variant: "destructive",
        title: validationError.includes("크기")
          ? "파일 크기 초과"
          : "파일 형식 오류",
        description: validationError,
      });
      event.target.value = "";
      return;
    }

    // 업로드 시작
    setIsUploadingImage(true);

    try {
      // 이미지 크기 읽기. 예시 : { width: 100, height: 100 }
      const { width, height } = await getImageDimensions(file);

      // Blob URL 생성 (메모리 효율적인 미리보기)
      const blobUrl = URL.createObjectURL(file);

      // File 객체를 Map에 저장 (나중에 서버 전송용)
      imageFileMapRef.current.set(blobUrl, file);

      // Blob URL을 사용하여 에디터에 이미지 삽입
      editor
        .chain()
        .focus()
        .setImage({
          src: blobUrl,
          alt: file.name,
          width: width,
          height: height,
          "data-blob-url": blobUrl, // 나중에 찾기 위한 식별자
        } as any)
        .run();
    } catch (error: any) {
      // 에러 메시지 표시
      toast({
        variant: "destructive",
        title: "이미지 처리 실패",
        description:
          error.message || "이미지를 처리하는 중 오류가 발생했습니다.",
      });
    } finally {
      setIsUploadingImage(false);
      // 파일 입력 초기화
      event.target.value = "";
    }
  };

  // 에디터에서 사용 중인 이미지 파일들을 가져오는 함수 (외부에서 호출 가능하도록)
  useEffect(() => {
    // editor 인스턴스에 이미지 파일 Map 접근 함수 추가
    (editor as any).getImageFiles = () => {
      return imageFileMapRef.current;
    };

    // 컴포넌트 언마운트 시 Blob URL 정리
    return () => {
      imageFileMapRef.current.forEach((_, blobUrl) => {
        URL.revokeObjectURL(blobUrl);
      });
      imageFileMapRef.current.clear();
    };
  }, [editor]);

  // YouTube 영상 삽입 핸들러
  const handleYouTubeInsert = () => {
    if (!youtubeUrl.trim()) {
      toast({
        variant: "warning",
        title: "URL 입력 필요",
        description: "YouTube URL을 입력해주세요.",
      });
      return;
    }

    // YouTube URL에서 video ID 추출
    const videoIdMatch = youtubeUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/
    );

    if (!videoIdMatch || !videoIdMatch[1]) {
      toast({
        variant: "destructive",
        title: "URL 형식 오류",
        description: "올바른 YouTube URL을 입력해주세요.",
      });
      return;
    }

    const videoId = videoIdMatch[1];

    // YouTube 영상 삽입
    const commands = editor.chain().focus() as any;
    commands.setYouTubeVideo({ src: youtubeUrl, videoId }).run();

    // 다이얼로그 닫기 및 입력 초기화
    setIsYouTubeDialogOpen(false);
    setYoutubeUrl("");
  };

  // YouTube 다이얼로그 열기
  const handleYouTubeClick = () => {
    setIsYouTubeDialogOpen(true);
    // 다이얼로그가 열리면 입력 필드에 포커스
    setTimeout(() => {
      youtubeInputRef.current?.focus();
    }, 100);
  };

  // 링크 버튼 클릭 핸들러
  const handleLinkClick = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    const linkAttributes = editor.getAttributes("link");

    // 이미 링크가 있는 경우 수정 모드
    if (linkAttributes.href) {
      setLinkUrl(linkAttributes.href);
      setLinkText(selectedText || "");
    } else {
      // 새 링크 모드
      setLinkUrl("");
      setLinkText(selectedText || "");
    }

    setIsLinkDialogOpen(true);
    // 다이얼로그가 열리면 URL 입력 필드에 포커스
    setTimeout(() => {
      linkUrlInputRef.current?.focus();
    }, 100);
  };

  // 링크 삽입/수정 핸들러
  const handleLinkInsert = () => {
    if (!linkUrl.trim()) {
      toast({
        variant: "warning",
        title: "URL 입력 필요",
        description: "링크 URL을 입력해주세요.",
      });
      return;
    }

    // URL 형식 검증 및 자동 보정
    let finalUrl = linkUrl.trim();
    if (!finalUrl.match(/^https?:\/\//i)) {
      finalUrl = `https://${finalUrl}`;
    }

    // URL 유효성 검증
    try {
      new URL(finalUrl);
    } catch {
      toast({
        variant: "destructive",
        title: "URL 형식 오류",
        description: "올바른 URL 형식을 입력해주세요.",
      });
      return;
    }

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    // 선택된 텍스트가 있으면 해당 텍스트에 링크 적용
    if (selectedText) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: finalUrl })
        .run();
    } else {
      // 선택된 텍스트가 없으면 링크 텍스트 또는 URL을 텍스트로 사용
      const textToInsert = linkText.trim() || finalUrl;
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${finalUrl}">${textToInsert}</a>`)
        .run();
    }

    // 다이얼로그 닫기 및 입력 초기화
    setIsLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
  };

  // 링크 제거 핸들러
  const handleLinkRemove = () => {
    editor.chain().focus().unsetLink().run();
    setIsLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
  };

  return (
    <div
      ref={toolbarRef}
      className="flex flex-wrap gap-1 p-1 border border-border rounded-t bg-background-2 sticky z-40"
      style={{ top: `${stickyTop}px` }}
    >
      {/*
        chain(): 명령어를 체이닝할 수 있게 해줍니다.
        focus(): 에디터에 포커스를 줍니다. 버튼 클릭 후 다시 에디터로 포커스를 돌려야 계속 타이핑이 가능합니다.
        toggleBold(): 굵게 스타일을 토글합니다.
        run(): 체인된 명령어를 실행합니다.
      */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive("bold"))}
        title="Bold"
      >
        <Bold size={15} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive("italic"))}
        title="Italic"
      >
        <Italic size={15} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive("strike"))}
        title="Strike"
      >
        <Strikethrough size={15} />
      </button>

      {/* 구분선 */}
      <div className="w-px border-l border-border mx-1 self-stretch" />

      {/* 글자 크기 선택 드롭다운 */}
      {/*
        토글 형태: 클릭 시 드롭다운이 열리고 닫힙니다.
        relative: 드롭다운 메뉴를 절대 위치로 배치하기 위한 기준점입니다.
      */}
      <div className="relative" ref={fontSizeDropdownRef}>
        {/* 글자 크기 버튼 */}
        {/*
          클릭 시 드롭다운 메뉴가 토글됩니다.
          현재 적용된 글자 크기를 버튼에 표시합니다.
        */}
        <button
          onClick={() => setIsFontSizeOpen(!isFontSizeOpen)}
          className={`${getButtonClass(
            isFontSizeOpen
          )} flex items-center gap-1`}
          title="Font Size"
        >
          <Type size={15} />
          <span className="text-xs">{getCurrentFontSize()}px</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${
              isFontSizeOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {/* 드롭다운 메뉴 */}
        {/*
          조건부 렌더링: isFontSizeOpen이 true일 때만 표시됩니다.
          absolute top-full: 버튼 바로 아래에 위치합니다.
          z-20: 다른 요소 위에 표시되도록 z-index를 높게 설정합니다.
          max-h-60 overflow-y-auto: 메뉴가 너무 길 경우 스크롤 가능하도록 합니다.
        */}
        {isFontSizeOpen && (
          <div className=" absolute top-full left-0 mt-1 bg-background-1 border border-border rounded shadow-lg p-1 min-w-[80px] z-20">
            <div className="max-h-70 overflow-y-auto">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => {
                    // 15px는 기본 크기이므로 글자 크기를 제거합니다.
                    if (size.value === "15") {
                      editor.chain().focus().unsetFontSize().run();
                    } else {
                      // 선택한 크기를 적용합니다.
                      editor.chain().focus().setFontSize(size.value).run();
                    }
                    // 크기 선택 후 드롭다운 닫기
                    setIsFontSizeOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1 text-xs hover:bg-muted rounded ${
                    getCurrentFontSize() === size.value
                      ? "bg-secondary text-accent-text font-semibold"
                      : ""
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="w-px border-l border-border mx-1 self-stretch" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        <List size={15} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass(editor.isActive("orderedList"))}
        title="Ordered List"
      >
        <ListOrdered size={15} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={getButtonClass(editor.isActive("blockquote"))}
        title="Blockquote"
      >
        <Quote size={15} />
      </button>

      {/* 구분선 */}
      <div className="w-px border-l border-border mx-1 self-stretch" />

      {/* 링크 버튼 */}
      <button
        onClick={handleLinkClick}
        className={getButtonClass(editor.isActive("link"))}
        title="Insert Link"
      >
        <Link size={15} />
      </button>

      {/* 이미지 업로드 버튼 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        disabled={isUploadingImage}
      />
      <button
        onClick={handleImageSelect}
        disabled={isUploadingImage}
        className={`${getButtonClass(false)} ${
          isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={isUploadingImage ? "이미지 업로드 중..." : "Insert Image"}
      >
        <ImageIcon size={15} />
      </button>

      {/* YouTube 영상 삽입 버튼 */}
      <button
        onClick={handleYouTubeClick}
        className={getButtonClass(false)}
        title="Insert YouTube Video"
      >
        <Youtube size={15} />
      </button>

      {/* 링크 입력 다이얼로그 */}
      {isLinkDialogOpen && (
        <div
          data-link-dialog
          className="absolute top-full left-0 mt-1 bg-background-1 border border-border rounded shadow-lg p-4 z-20 min-w-[400px]"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                ref={linkUrlInputRef}
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLinkInsert();
                  } else if (e.key === "Escape") {
                    setIsLinkDialogOpen(false);
                    setLinkUrl("");
                    setLinkText("");
                  }
                }}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-accent rounded bg-background-1 text-foreground text-sm focus:outline-none focus:ring-accent focus:ring-1"
              />
            </div>
            {!editor.state.doc.textBetween(
              editor.state.selection.from,
              editor.state.selection.to,
              " "
            ) && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  링크 텍스트 (선택 사항)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLinkInsert();
                    } else if (e.key === "Escape") {
                      setIsLinkDialogOpen(false);
                      setLinkUrl("");
                      setLinkText("");
                    }
                  }}
                  placeholder="링크 텍스트"
                  className="w-full px-3 py-2 border border-accent rounded bg-background-1 text-foreground text-sm focus:outline-none focus:ring-accent focus:ring-1"
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              {editor.isActive("link") && (
                <Button
                  variant="cancel-outline"
                  size="sm"
                  onClick={handleLinkRemove}
                >
                  제거
                </Button>
              )}
              <Button
                variant="cancel-outline"
                size="sm"
                onClick={() => {
                  setIsLinkDialogOpen(false);
                  setLinkUrl("");
                  setLinkText("");
                }}
              >
                취소
              </Button>
              <Button
                variant="accent-outline"
                size="sm"
                onClick={handleLinkInsert}
              >
                {editor.isActive("link") ? "수정" : "삽입"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube URL 입력 다이얼로그 */}
      {isYouTubeDialogOpen && (
        <div
          data-youtube-dialog
          className="absolute top-full right-0 mt-1 bg-background-1 border border-border rounded shadow-lg p-4 z-20 min-w-[400px]"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                YouTube URL
              </label>
              <input
                ref={youtubeInputRef}
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleYouTubeInsert();
                  } else if (e.key === "Escape") {
                    setIsYouTubeDialogOpen(false);
                    setYoutubeUrl("");
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-accent rounded bg-background-1 text-foreground text-sm focus:outline-none focus:ring-accent focus:ring-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                YouTube URL 또는 video ID를 입력하세요
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="cancel-outline"
                size="sm"
                onClick={() => {
                  setIsYouTubeDialogOpen(false);
                  setYoutubeUrl("");
                }}
              >
                취소
              </Button>
              <Button
                variant="accent-outline"
                size="sm"
                onClick={handleYouTubeInsert}
              >
                삽입
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
