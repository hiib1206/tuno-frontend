import { Extension } from "@tiptap/core";

/**
 * FontSize Extension 정의
 * Tiptap에서 글자 크기를 제어하기 위한 커스텀 extension입니다.
 *
 * 작동 원리:
 * 1. addGlobalAttributes(): textStyle에 fontSize 속성을 추가합니다.
 * 2. parseHTML: HTML에서 fontSize를 읽어옵니다 (예: style="font-size: 16px" → "16")
 * 3. renderHTML: fontSize 값을 HTML의 인라인 스타일로 변환합니다 (예: "16" → style="font-size: 16px")
 * 4. addCommands(): setFontSize와 unsetFontSize 명령어를 추가합니다.
 *    - setFontSize: 선택된 텍스트에 글자 크기를 적용합니다.
 *    - unsetFontSize: 적용된 글자 크기를 제거합니다.
 */
export const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null, // 기본값은 null (글자 크기 미적용)
            // HTML에서 fontSize를 읽어오는 함수
            // element.style.fontSize가 "16px" 형태이므로 "px"를 제거하여 "16"만 반환
            parseHTML: (element: HTMLElement) => {
              const fontSize = element.style.fontSize;
              return fontSize ? fontSize.replace("px", "") : null;
            },
            // fontSize 값을 HTML 인라인 스타일로 변환하는 함수
            // "16" → style="font-size: 16px"
            renderHTML: (attributes: { fontSize?: string | null }) => {
              if (!attributes.fontSize) {
                return {}; // fontSize가 없으면 스타일을 적용하지 않음
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      // 글자 크기를 설정하는 명령어
      // 사용 예: editor.chain().focus().setFontSize("20").run()
      // 주의: ({ chain })에서 타입을 명시적으로 지정하면 안 됩니다.
      // Tiptap이 내부적으로 올바른 객체를 주입하므로, 타입 지정 시 undefined로 인식될 수 있습니다.
      // 타입을 제거하고 Tiptap이 자동으로 주입하도록 합니다.
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          // textStyle 마크에 fontSize 속성을 설정합니다.
          return chain().setMark("textStyle", { fontSize }).run();
        },
      // 글자 크기를 제거하는 명령어
      // 사용 예: editor.chain().focus().unsetFontSize().run()
      unsetFontSize:
        () =>
        ({ chain }) => {
          // textStyle 마크에서 fontSize를 null로 설정하고, 빈 textStyle을 제거합니다.
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
