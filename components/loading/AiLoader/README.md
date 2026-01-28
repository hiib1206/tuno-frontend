# AILoader 컴포넌트

AI 로딩 애니메이션 컴포넌트

```
components/
  └── AiLoader/
      ├── index.ts
      ├── AILoader.tsx
      └── AILoader.css
```

## 사용법

```tsx
import AiLoader from '@/components/AILoader';

// 기본 사용
<AiLoader isActive={true} />

// 커스텀 색상 (hue 변경)
<AiLoader isActive={true} hue={200} />  // 파란색 계열
<AiLoader isActive={true} hue={280} />  // 보라색 계열
<AiLoader isActive={true} hue={30} />   // 주황색 계열

// 크기 변경
<AiLoader isActive={true} size={80} />   // 작게
<AiLoader isActive={true} size={200} />  // 크게

// 텍스트 변경
<AiLoader 
  isActive={isLoading} 
  activeText="처리중" 
  inactiveText="대기" 
/>

// 클릭 가능
<AiLoader 
  isActive={isActive} 
  clickable={true}
  onClick={() => setIsActive(!isActive)} 
/>
```

## Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `size` | `number` | `160` | 크기 (px) |
| `isActive` | `boolean` | `false` | 활성화 상태 |
| `hue` | `number` | `150` | oklch hue 값 (0-360) |
| `activeText` | `string` | `"AI"` | 활성화 시 텍스트 |
| `inactiveText` | `string` | `"시작"` | 비활성화 시 텍스트 |
| `onClick` | `() => void` | - | 클릭 핸들러 |
| `clickable` | `boolean` | `false` | 커서 포인터 여부 |

## 색상 가이드 (hue 값)

| hue | 색상 |
|-----|------|
| 0 | 빨강 |
| 30 | 주황 |
| 60 | 노랑 |
| 120 | 초록 |
| 150 | 민트/청록 (기본) |
| 200 | 하늘/파랑 |
| 280 | 보라 |
| 330 | 핑크 |
