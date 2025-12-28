"use client";

import TiptapEditor from "@/components/editor/TiptapEditor";

export default function TestTiptap() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tiptap Editor Study</h1>
        <p className="text-gray-600">
          Tiptap의 기본 구조와 사용법을 익히기 위한 테스트 페이지입니다.
          <br />
          에디터는 재사용 가능한 컴포넌트로 분리되어 있습니다.
        </p>
      </div>

      {/* 재사용 가능한 TiptapEditor 컴포넌트 사용 */}
      <TiptapEditor
        content="<p>Hello World</p>"
        onUpdate={(html, json) => {
          // 여기서 변경된 내용을 저장하거나 처리할 수 있습니다.
          // console.log(html);
          // console.log(json);
          // 서버로 저장하는 로직을 여기에 추가할 수 있습니다.
          // 예: await saveToServer({ html, json });
        }}
        minHeight="500px"
      />

      <div className="mt-8 p-4 bg-gray-100 rounded text-sm text-gray-500">
        <h3 className="font-bold mb-2">구현 포인트:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>재사용 가능한 컴포넌트</strong>: TiptapEditor 컴포넌트를
            다른 페이지에서도 쉽게 사용할 수 있습니다.
          </li>
          <li>
            <strong>컴포넌트 분리</strong>:
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>
                <code>components/editor/FontSizeExtension.ts</code>: 커스텀
                Extension
              </li>
              <li>
                <code>components/editor/EditorMenuBar.tsx</code>: 툴바 컴포넌트
              </li>
              <li>
                <code>components/editor/TiptapEditor.tsx</code>: 메인 에디터
                컴포넌트
              </li>
            </ul>
          </li>
          <li>
            <strong>Props로 커스터마이징</strong>: content, onUpdate, minHeight,
            showToolbar 등 다양한 옵션 제공
          </li>
          <li>
            <strong>사용 예시</strong>:
            <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-x-auto">
              {`<TiptapEditor
  content="<p>초기 내용</p>"
  onUpdate={(html, json) => console.log(html, json)}
  minHeight="300px"
/>`}
            </pre>
          </li>
        </ul>
      </div>
    </div>
  );
}
