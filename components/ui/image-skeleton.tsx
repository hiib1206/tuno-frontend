"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface ImageWithSkeletonProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function ImageWithSkeleton({
  src,
  alt,
  className = "",
  fallback,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // src가 변경되면 상태 리셋
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    // 이미지가 이미 캐시되어 로드 완료된 경우 처리
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  const showSkeleton = !src || (!isLoaded && !hasError);
  const showFallback = hasError && fallback;
  const showImage = src && !hasError;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* 스켈레톤 */}
      <AnimatePresence>
        {showSkeleton && !showFallback && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="skeleton-gradient-image absolute inset-0"
          />
        )}
      </AnimatePresence>

      {/* 에러 시 폴백 */}
      {showFallback && fallback}

      {/* 이미지 (Fade 전환) */}
      {showImage && (
        <motion.img
          ref={imgRef}
          key={src}
          src={src}
          alt={alt}
          loading="lazy" // 성능 최적화
          referrerPolicy="no-referrer" // 외부 이미지 차단 우회
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
