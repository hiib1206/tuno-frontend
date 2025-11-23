import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface ProfileAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  textSize?: "sm" | "md" | "lg" | "xl" | "2xl";
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

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-20 w-20",
    xl: "h-24 w-24",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
    "2xl": "text-4xl",
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

  // user가 있지만 프로필 이미지 URL이 없으면 닉네임 첫 글자 표시
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage
        className={cn("object-cover", textSizes[effectiveTextSize])}
        src={`${user.profileImageUrl}?t=${Date.now()}` || undefined}
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
