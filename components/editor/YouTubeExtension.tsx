import { Node, mergeAttributes } from "@tiptap/core";

/**
 * YouTube URL에서 video ID를 추출하는 함수
 */
function getYouTubeVideoId(url: string): string | null {
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
}

/**
 * YouTube Extension
 * YouTube 영상을 삽입할 수 있는 커스텀 extension
 */
export const YouTubeExtension = Node.create({
  name: "youtube",

  addOptions() {
    return {
      inline: false,
      allowFullscreen: true,
      width: 800,
      height: 450,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return "block";
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          const iframe = element.querySelector("iframe");
          return iframe?.getAttribute("src") || null;
        },
      },
      videoId: {
        default: null,
        parseHTML: (element) => {
          const iframe = element.querySelector("iframe");
          const src = iframe?.getAttribute("src") || "";
          const match = src.match(/(?:embed\/|v=)([^&\n?#]+)/);
          return match ? match[1] : null;
        },
      },
      width: {
        default: this.options.width,
        parseHTML: (element) => {
          const iframe = element.querySelector("iframe");
          return iframe?.getAttribute("width") || this.options.width;
        },
      },
      height: {
        default: this.options.height,
        parseHTML: (element) => {
          const iframe = element.querySelector("iframe");
          return iframe?.getAttribute("height") || this.options.height;
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="youtube"]',
      },
      {
        tag: "iframe[src*='youtube.com']",
        getAttrs: (node) => {
          if (typeof node === "string") return false;
          const iframe = node as HTMLIFrameElement;
          const src = iframe.getAttribute("src") || "";
          if (src.includes("youtube.com") || src.includes("youtu.be")) {
            return {};
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const videoId = HTMLAttributes.videoId;
    const width = HTMLAttributes.width || this.options.width;
    const height = HTMLAttributes.height || this.options.height;

    if (!videoId) {
      return ["div", { "data-type": "youtube" }, ["p", "Invalid YouTube URL"]];
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return [
      "div",
      {
        "data-type": "youtube",
        class: "youtube-wrapper",
        style: `width: 100%; max-width: ${width}px; margin: 1rem auto;`,
      },
      [
        "iframe",
        mergeAttributes(
          {
            width: String(width),
            height: String(height),
            src: embedUrl,
            frameborder: "0",
            allow:
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowfullscreen: this.options.allowFullscreen ? "true" : undefined,
          },
          this.options.HTMLAttributes
        ),
      ],
    ];
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.className = "youtube-resize-wrapper";
      dom.style.position = "relative";
      dom.style.display = "inline-block";
      dom.style.margin = "0.5rem 0";
      dom.style.width = "100%";
      dom.style.maxWidth = `${node.attrs.width || this.options.width}px`;
      dom.style.marginLeft = "auto";
      dom.style.marginRight = "auto";

      const videoId = node.attrs.videoId;
      const width = node.attrs.width || this.options.width;
      const height = node.attrs.height || this.options.height;

      if (!videoId) {
        const errorDiv = document.createElement("div");
        errorDiv.textContent = "Invalid YouTube URL";
        dom.appendChild(errorDiv);
        return { dom };
      }

      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      // 선택 상태 업데이트 함수
      const updateSelection = () => {
        if (!editor.isEditable) return;
        const { selection } = editor.state;
        const pos = getPos();
        if (typeof pos === "number") {
          const isSelected =
            selection.from <= pos && selection.to >= pos + node.nodeSize;
          if (isSelected) {
            dom.classList.add("selected");
          } else {
            dom.classList.remove("selected");
          }
        }
      };

      // 편집 모드일 때는 썸네일 이미지 표시
      if (editor.isEditable) {
        const thumbnailContainer = document.createElement("div");
        thumbnailContainer.style.position = "relative";
        thumbnailContainer.style.width = "100%";
        thumbnailContainer.style.paddingBottom = `${(height / width) * 100}%`;
        thumbnailContainer.style.backgroundImage = `url(${thumbnailUrl})`;
        thumbnailContainer.style.backgroundSize = "cover";
        thumbnailContainer.style.backgroundPosition = "center";
        thumbnailContainer.style.cursor = "pointer";
        thumbnailContainer.style.overflow = "hidden";

        // 재생 버튼 아이콘 추가
        const playButton = document.createElement("div");
        playButton.style.position = "absolute";
        playButton.style.top = "50%";
        playButton.style.left = "50%";
        playButton.style.transform = "translate(-50%, -50%)";
        playButton.style.width = "68px";
        playButton.style.height = "48px";
        playButton.style.backgroundColor = "rgba(23, 35, 34, 0.9)";
        playButton.style.borderRadius = "14px";
        playButton.style.display = "flex";
        playButton.style.alignItems = "center";
        playButton.style.justifyContent = "center";
        playButton.style.pointerEvents = "none";

        // 재생 아이콘 (삼각형)
        const playIcon = document.createElement("div");
        playIcon.style.width = "0";
        playIcon.style.height = "0";
        playIcon.style.borderLeft = "20px solid white";
        playIcon.style.borderTop = "12px solid transparent";
        playIcon.style.borderBottom = "12px solid transparent";
        playIcon.style.marginLeft = "4px";

        playButton.appendChild(playIcon);
        thumbnailContainer.appendChild(playButton);

        // 클릭 시 노드 선택
        thumbnailContainer.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const pos = getPos();
          if (typeof pos === "number") {
            editor.commands.setNodeSelection(pos);
          }
        });

        editor.on("selectionUpdate", updateSelection);
        editor.on("transaction", updateSelection);

        dom.appendChild(thumbnailContainer);
      } else {
        // 읽기 모드일 때는 iframe으로 표시 (재생 가능)
        const iframe = document.createElement("iframe");
        iframe.width = String(width);
        iframe.height = String(height);
        iframe.src = embedUrl;
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute(
          "allow",
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        );
        if (this.options.allowFullscreen) {
          iframe.setAttribute("allowfullscreen", "true");
        }
        iframe.style.width = "100%";
        iframe.style.height = "auto";
        iframe.style.aspectRatio = `${width} / ${height}`;

        // HTMLAttributes의 다른 속성들 적용
        Object.entries(HTMLAttributes).forEach(([key, value]) => {
          if (value != null && key !== "width" && key !== "height") {
            iframe.setAttribute(key, String(value));
          }
        });

        dom.appendChild(iframe);
      }

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) {
            return false;
          }
          node = updatedNode;
          return true;
        },
        destroy: () => {
          if (editor.isEditable) {
            editor.off("selectionUpdate", updateSelection);
            editor.off("transaction", updateSelection);
          }
        },
      };
    };
  },

  addCommands() {
    return {
      setYouTubeVideo:
        (options: { src: string; videoId?: string }) =>
        ({ chain }: { chain: any }) => {
          let videoId: string | undefined = options.videoId;

          // videoId가 없으면 src에서 추출
          if (!videoId && options.src) {
            const extractedId = getYouTubeVideoId(options.src);
            videoId = extractedId ?? undefined;
          }

          if (!videoId) {
            return false;
          }

          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                videoId,
                src: `https://www.youtube.com/embed/${videoId}`,
              },
            })
            .run();
        },
    } as any;
  },
});
