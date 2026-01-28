import React, { useEffect, useRef, useState } from 'react';
import './AILoader.css';

interface AILoaderProps {
  /** 크기 (px) - 기본값 160 */
  size?: number;
  /** 활성화 상태 */
  isActive?: boolean;
  /** oklch hue 값 (0-360) - 기본값 150 (민트/청록) */
  hue?: number;
  /** 활성화 시 텍스트 - 기본값 "AI" */
  activeText?: string;
  /** 비활성화 시 텍스트 - 기본값 "시작" */
  inactiveText?: string;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 커서 포인터 여부 - 기본값 false */
  clickable?: boolean;
}

const AILoader: React.FC<AILoaderProps> = ({
  size = 160,
  isActive = false,
  hue = 150,
  activeText = 'AI',
  inactiveText = '시작',
  onClick,
  clickable = false,
}) => {
  const [displayText, setDisplayText] = useState(isActive ? activeText : inactiveText);
  const [fontSize, setFontSize] = useState(isActive ? 56 : 44);
  const [isBlurring, setIsBlurring] = useState(false);
  const prevIsActive = useRef(isActive);

  // 텍스트 전환 애니메이션
  useEffect(() => {
    if (prevIsActive.current !== isActive) {
      setIsBlurring(true);
      
      const timer = setTimeout(() => {
        setDisplayText(isActive ? activeText : inactiveText);
        setFontSize(isActive ? 56 : 44);
        setIsBlurring(false);
      }, 350);

      prevIsActive.current = isActive;
      return () => clearTimeout(timer);
    }
  }, [isActive, activeText, inactiveText]);

  // 그라데이션 링 데이터 생성
  const ringSegments = [
    { l: 0.95, c: 0.08, dasharray: '8 600', offset: 0, opacity: 0.1 },
    { l: 0.94, c: 0.08, dasharray: '10 600', offset: -8, opacity: 0.15 },
    { l: 0.93, c: 0.09, dasharray: '10 600', offset: -16, opacity: 0.2 },
    { l: 0.92, c: 0.09, dasharray: '12 600', offset: -24, opacity: 0.3 },
    { l: 0.91, c: 0.10, dasharray: '12 600', offset: -32, opacity: 0.4 },
    { l: 0.90, c: 0.10, dasharray: '14 600', offset: -40, opacity: 0.5 },
    { l: 0.89, c: 0.11, dasharray: '14 600', offset: -48, opacity: 0.6 },
    { l: 0.88, c: 0.11, dasharray: '16 600', offset: -56, opacity: 0.7 },
    { l: 0.87, c: 0.12, dasharray: '16 600', offset: -64, opacity: 0.8 },
    { l: 0.86, c: 0.12, dasharray: '18 600', offset: -72, opacity: 0.9 },
    { l: 0.85, c: 0.13, dasharray: '18 600', offset: -80, opacity: 0.95 },
    { l: 0.84, c: 0.13, dasharray: '18 600', offset: -88, opacity: 1 },
    { l: 0.82, c: 0.14, dasharray: '18 600', offset: -96, opacity: 1 },
    { l: 0.80, c: 0.15, dasharray: '18 600', offset: -104, opacity: 1 },
    { l: 0.78, c: 0.16, dasharray: '18 600', offset: -112, opacity: 1 },
    { l: 0.77, c: 0.16, dasharray: '18 600', offset: -120, opacity: 1 },
    { l: 0.76, c: 0.17, dasharray: '18 600', offset: -128, opacity: 1 },
    { l: 0.75, c: 0.17, dasharray: '18 600', offset: -136, opacity: 1 },
    { l: 0.74, c: 0.18, dasharray: '18 600', offset: -144, opacity: 1 },
    { l: 0.73, c: 0.18, dasharray: '18 600', offset: -152, opacity: 1 },
    { l: 0.72, c: 0.19, dasharray: '18 600', offset: -160, opacity: 1 },
    { l: 0.71, c: 0.19, dasharray: '18 600', offset: -168, opacity: 1 },
    { l: 0.70, c: 0.20, dasharray: '18 600', offset: -176, opacity: 1 },
    { l: 0.69, c: 0.20, dasharray: '18 600', offset: -184, opacity: 1 },
    { l: 0.68, c: 0.21, dasharray: '18 600', offset: -192, opacity: 1 },
    { l: 0.67, c: 0.21, dasharray: '18 600', offset: -200, opacity: 1 },
    { l: 0.66, c: 0.22, dasharray: '18 600', offset: -208, opacity: 1 },
    { l: 0.66, c: 0.22, dasharray: '18 600', offset: -216, opacity: 1 },
    { l: 0.65, c: 0.22, dasharray: '18 600', offset: -224, opacity: 1 },
    { l: 0.65, c: 0.22, dasharray: '18 600', offset: -232, opacity: 1 },
  ];

  const baseColor = `oklch(0.65 0.22 ${hue})`;

  return (
    <div 
      className={`ai-loader ${isActive ? 'active' : ''}`}
      style={{ 
        width: size, 
        height: size,
        cursor: clickable ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <svg viewBox="17 17 166 166">
        {/* 배경 원 */}
        <circle className="ai-loader-bg-circle" cx="100" cy="100" r="67" />
        
        {/* 배경 링 (연한 회색) */}
        <circle 
          cx="100" 
          cy="100" 
          r="75" 
          fill="none" 
          stroke="var(--ai-loader-ring)" 
          strokeWidth="16" 
        />
        
        {/* 회전 링 - 30조각 그라데이션 */}
        <g className="ai-loader-ring-group">
          {ringSegments.map((segment, index) => (
            <circle
              key={index}
              className="ai-loader-ring"
              cx="100"
              cy="100"
              r="75"
              stroke={`oklch(${segment.l} ${segment.c} ${hue})`}
              strokeDasharray={segment.dasharray}
              strokeDashoffset={segment.offset}
              style={{ opacity: segment.opacity }}
            />
          ))}
        </g>
        
        {/* 반짝이 */}
        <g className="ai-loader-sparkles">
          <path
            className="ai-loader-sparkle"
            d="M58,70 L61,61 L64,70 L73,73 L64,76 L61,85 L58,76 L49,73 Z"
            fill={baseColor}
          />
          <path
            className="ai-loader-sparkle"
            d="M72,60 L74,54 L76,60 L82,62 L76,64 L74,70 L72,64 L66,62 Z"
            fill={baseColor}
          />
        </g>
        
        {/* 메인 텍스트 */}
        <text
          className={`ai-loader-text ${isBlurring ? 'blur-out' : ''}`}
          x="100" 
          y="100" 
          textAnchor="middle" 
          dominantBaseline="central"
          fontSize={fontSize}
          fill={baseColor}
        >
          {displayText}
        </text>
      </svg>
    </div>
  );
};

export default AILoader;
