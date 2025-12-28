/**
 * Tiptap 에디터 관련 유틸리티 함수들
 */

/**
 * Tiptap JSON에서 텍스트만 추출하는 함수
 * @param content - Tiptap JSON 문자열 또는 일반 문자열
 * @returns 추출된 텍스트 문자열
 */
export function extractTextFromTiptapJson(content: string): string {
  try {
    const json = JSON.parse(content);
    if (typeof json === "object" && json.content) {
      // 재귀적으로 텍스트 추출
      const extractText = (node: any): string => {
        if (node.type === "text" && node.text) {
          return node.text;
        }
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join(" ");
        }
        return "";
      };
      return extractText(json).trim();
    }
  } catch {
    // JSON이 아니면 그대로 반환
  }
  return content;
}
