import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface ProfileAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  textSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showFallback?: boolean;
}

export function ProfileAvatar({
  size = "md",
  textSize,
  className,
  showFallback = true,
}: ProfileAvatarProps) {
  const { user } = useAuthStore();

  // 아바타 크기 정의 (각각의 의미)
  // xs: 매우 작은 아이콘/배지용 (20px)
  // sm: 작은 메뉴/헤더용 (32px)
  // md: 기본 크기/사이드바용 (40px)
  // lg: 중간 크기/카드용 (64px)
  // xl: 큰 프로필 이미지/설정 페이지용 (96px)
  // 2xl: 매우 큰 프로필 이미지/프로필 페이지용 (128px)
  const sizeClasses = {
    xs: "h-5 w-5", // 20px - 매우 작은 아이콘/배지
    sm: "h-8 w-8", // 32px - 작은 메뉴/헤더
    md: "h-10 w-10", // 40px - 기본 크기/사이드바
    lg: "h-16 w-16", // 64px - 중간 크기/카드
    xl: "h-24 w-24", // 96px - 큰 프로필 이미지/설정 페이지
    "2xl": "h-32 w-32", // 128px - 매우 큰 프로필 이미지
  };

  const textSizes = {
    xs: "text-xs", // 12px
    sm: "text-sm", // 14px
    md: "text-base", // 16px
    lg: "text-xl", // 20px
    xl: "text-2xl", // 24px
    "2xl": "text-4xl", // 36px
  };

  // textSize가 지정되지 않으면 size를 사용
  const effectiveTextSize = textSize || size;

  // user가 없으면 placeholder 이미지만 표시
  if (!user) {
    return (
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage
          className={cn("object-cover", textSizes[effectiveTextSize])}
          src="/placeholder.svg"
          alt="프로필"
        />
      </Avatar>
    );
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage
        className={cn("object-cover", textSizes[effectiveTextSize])}
        src={
          user.profileImageUrl
            ? `${user.profileImageUrl}${
                user.profileImageUpdatedAt
                  ? `?t=${user.profileImageUpdatedAt.getTime()}`
                  : ""
              }`
            : undefined
        }
        alt="프로필"
      />
      {showFallback && (
        <AvatarFallback className={cn(textSizes[effectiveTextSize])}>
          {user.nick?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
