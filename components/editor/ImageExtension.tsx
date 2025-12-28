import Image from "@tiptap/extension-image";

/**
 * ImageExtension
 * 리사이즈 기능이 포함된 커스텀 Image extension
 */
export const ResizableImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("width");
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute("height");
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
    };
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.className = "image-resize-wrapper";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      img.style.display = "block";
      img.style.maxWidth = "100%";
      img.style.height = "auto"; // 비율 유지를 위해 항상 auto로 설정
      // 읽기 전용 모드에서는 포인터 커서 제거
      img.style.cursor = editor.isEditable ? "pointer" : "default";
      img.draggable = false;

      // width만 설정하고 height는 auto로 유지하여 비율 보존
      if (node.attrs.width) {
        img.style.width = `${node.attrs.width}px`;
        img.setAttribute("width", String(node.attrs.width));
      }
      // height는 설정하지 않음 (auto로 유지하여 비율 보존)

      // HTMLAttributes의 다른 속성들 적용
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value != null && key !== "width" && key !== "height") {
          img.setAttribute(key, String(value));
        }
      });

      // 리사이즈 핸들 4개 생성
      const createResizeHandle = (
        position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
      ) => {
        const handle = document.createElement("div");
        handle.className = `resize-handle resize-handle-${position}`;
        handle.style.display = "none";
        handle.setAttribute("data-direction", position);
        return handle;
      };

      const resizeHandles = {
        topLeft: createResizeHandle("top-left"),
        topRight: createResizeHandle("top-right"),
        bottomLeft: createResizeHandle("bottom-left"),
        bottomRight: createResizeHandle("bottom-right"),
      };

      let isResizing = false;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let aspectRatio = 1; // 원본 비율
      let resizeDirection: string | null = null; // 리사이즈 방향 저장

      const handleMouseDown = (e: MouseEvent) => {
        // 읽기 전용 모드에서는 resize 비활성화
        if (!editor.isEditable) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = node.attrs.width || img.offsetWidth;
        // height는 auto이므로 실제 렌더링된 높이를 사용하여 비율 계산
        startHeight = img.offsetHeight;
        // 원본 비율 계산
        aspectRatio = startWidth / startHeight;

        // 핸들의 방향 정보 가져오기
        const target = e.target as HTMLElement;
        resizeDirection = target.getAttribute("data-direction");

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        dom.classList.add("resizing");
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing || !resizeDirection) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // 방향에 따라 deltaX, deltaY 부호 조정
        let adjustedDeltaX = deltaX;
        let adjustedDeltaY = deltaY;

        if (resizeDirection === "top-left") {
          adjustedDeltaX = -deltaX;
          adjustedDeltaY = -deltaY;
        } else if (resizeDirection === "top-right") {
          adjustedDeltaX = deltaX;
          adjustedDeltaY = -deltaY;
        } else if (resizeDirection === "bottom-left") {
          adjustedDeltaX = -deltaX;
          adjustedDeltaY = deltaY;
        } else if (resizeDirection === "bottom-right") {
          adjustedDeltaX = deltaX;
          adjustedDeltaY = deltaY;
        }

        // ProseMirror content 영역의 최대 너비 계산
        const proseMirrorContent = editor.view.dom.querySelector(
          ".ProseMirror"
        ) as HTMLElement;
        const maxWidth = proseMirrorContent
          ? proseMirrorContent.getBoundingClientRect().width
          : editor.view.dom.getBoundingClientRect().width;

        // 항상 비율 유지: 대각선 거리를 계산하여 비율에 맞게 조정
        // deltaX와 deltaY 중 더 큰 변화량을 기준으로 사용
        const delta =
          Math.abs(adjustedDeltaX) > Math.abs(adjustedDeltaY)
            ? adjustedDeltaX
            : adjustedDeltaY;

        const MIN_SIZE = 50;

        // 비율에 맞게 너비와 높이 계산
        let newWidth = startWidth + delta;
        let newHeight = newWidth / aspectRatio;

        // 최소 크기 보장: 너비와 높이 중 작은 값이 최소 크기보다 작으면
        // 그 값을 기준으로 다른 값을 비율에 맞게 조정
        if (newWidth < MIN_SIZE && newHeight < MIN_SIZE) {
          // 둘 다 최소보다 작으면, 더 큰 값을 최소로 설정하고 비율 유지
          if (newWidth > newHeight) {
            newWidth = MIN_SIZE;
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = MIN_SIZE;
            newWidth = newHeight * aspectRatio;
          }
        } else if (newWidth < MIN_SIZE) {
          // 너비만 최소보다 작으면 높이 기준으로 너비 계산
          newWidth = newHeight * aspectRatio;
          if (newWidth < MIN_SIZE) {
            newWidth = MIN_SIZE;
            newHeight = newWidth / aspectRatio;
          }
        } else if (newHeight < MIN_SIZE) {
          // 높이만 최소보다 작으면 너비 기준으로 높이 계산
          newHeight = newWidth / aspectRatio;
          if (newHeight < MIN_SIZE) {
            newHeight = MIN_SIZE;
            newWidth = newHeight * aspectRatio;
          }
        }

        // 최대 너비 제한 (비율 유지)
        if (newWidth > maxWidth) {
          newWidth = maxWidth;
          newHeight = newWidth / aspectRatio;
        }

        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;
      };

      const handleMouseUp = () => {
        if (!isResizing) return;

        isResizing = false;
        resizeDirection = null; // 방향 초기화
        dom.classList.remove("resizing");

        // 리사이즈 종료 후 height를 auto로 설정하여 비율 유지
        img.style.height = "auto";

        const pos = getPos();
        if (typeof pos === "number") {
          const finalWidth = parseInt(img.style.width, 10);
          // width만 저장하고 height는 제거하여 비율 유지
          editor.commands.updateAttributes("image", {
            width: finalWidth,
            height: null, // height 제거하여 비율 자동 유지
          });
        }

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      // 각 핸들에 이벤트 리스너 추가
      Object.values(resizeHandles).forEach((handle) => {
        handle.addEventListener("mousedown", handleMouseDown);
      });

      // 이미지 클릭 시 노드 선택
      img.addEventListener("click", (e) => {
        e.preventDefault();
        const pos = getPos();
        if (typeof pos === "number") {
          editor.commands.setNodeSelection(pos);
        }
      });

      // 선택 상태 업데이트
      const updateSelection = () => {
        const { selection } = editor.state;
        const pos = getPos();
        if (typeof pos === "number") {
          const isSelected =
            selection.from <= pos && selection.to >= pos + node.nodeSize;
          // 읽기 전용 모드에서는 resize handle을 표시하지 않음
          const isEditable = editor.isEditable;
          const shouldShow = isSelected && isEditable;

          if (shouldShow) {
            dom.classList.add("selected");
            Object.values(resizeHandles).forEach((handle) => {
              handle.style.display = "block";
            });
          } else {
            dom.classList.remove("selected");
            Object.values(resizeHandles).forEach((handle) => {
              handle.style.display = "none";
            });
          }
        }
      };

      // 이미지 로드 시 원본 크기 저장 (한 번만 실행)
      let hasSetInitialSize = false;
      const setInitialSize = () => {
        if (
          !hasSetInitialSize &&
          !node.attrs.width &&
          !node.attrs.height &&
          img.naturalWidth > 0
        ) {
          hasSetInitialSize = true;
          const pos = getPos();
          if (typeof pos === "number") {
            // 초기 크기 설정 시 width만 저장하여 비율 유지
            editor.commands.updateAttributes("image", {
              width: img.naturalWidth,
              height: null, // height는 저장하지 않음
            });
          }
        }
      };

      img.addEventListener("load", setInitialSize);

      // 이미지가 이미 로드된 경우 (cached)
      if (img.complete && img.naturalWidth > 0) {
        setInitialSize();
      }

      // 노드 업데이트 처리
      const updateNode = (updatedNode: typeof node) => {
        if (updatedNode.attrs.width) {
          img.style.width = `${updatedNode.attrs.width}px`;
          img.setAttribute("width", String(updatedNode.attrs.width));
        } else {
          img.style.width = "auto";
          img.removeAttribute("width");
        }

        // height는 항상 auto로 설정하여 비율 유지
        img.style.height = "auto";
        img.removeAttribute("height");

        if (updatedNode.attrs.src !== img.src) {
          img.src = updatedNode.attrs.src;
          hasSetInitialSize = false; // 새 이미지 로드 시 플래그 리셋
        }
        if (updatedNode.attrs.alt !== img.alt) {
          img.alt = updatedNode.attrs.alt || "";
        }
      };

      editor.on("selectionUpdate", updateSelection);
      editor.on("transaction", updateSelection);

      dom.appendChild(img);
      // 모든 핸들을 DOM에 추가
      Object.values(resizeHandles).forEach((handle) => {
        dom.appendChild(handle);
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) {
            return false;
          }
          const oldWidth = node.attrs.width;
          const oldHeight = node.attrs.height;
          node = updatedNode;
          updateNode(updatedNode);

          // 리사이즈 중이 아닐 때만 선택 상태 업데이트
          if (!isResizing) {
            updateSelection();
          }

          // 크기가 변경되었고 리사이즈 중이 아니면 시작 크기 업데이트
          if (!isResizing && oldWidth !== updatedNode.attrs.width) {
            startWidth = updatedNode.attrs.width || img.offsetWidth;
            // height는 auto이므로 실제 렌더링된 높이를 사용
            startHeight = img.offsetHeight;
          }

          return true;
        },
        destroy: () => {
          editor.off("selectionUpdate", updateSelection);
          editor.off("transaction", updateSelection);
          Object.values(resizeHandles).forEach((handle) => {
            handle.removeEventListener("mousedown", handleMouseDown);
          });
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        },
      };
    };
  },
});
