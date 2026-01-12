import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 날짜를 YYYY.MM.DD 형식으로 포맷팅합니다.
 * @param date - 포맷팅할 날짜 (Date 객체 또는 문자열)
 * @returns 포맷팅된 날짜 문자열 (예: "2024.01.15")
 */
export function formatDate(date?: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅합니다.
 * ISO 8601 날짜 형식과 유사한 하이픈 구분 형식입니다.
 * @param date - 포맷팅할 날짜 (Date 객체 또는 문자열)
 * @returns 포맷팅된 날짜 문자열 (예: "2024-01-15")
 */
export function formatDateISO(date?: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 날짜와 시간을 YYYY-MM-DD HH:mm 형식으로 포맷팅합니다.
 * @param date - 포맷팅할 날짜 (Date 객체 또는 문자열)
 * @returns 포맷팅된 날짜/시간 문자열 (예: "2024-01-15 14:30")
 */
export function formatDateTime(date?: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 날짜를 상대 시간 형식으로 포맷팅합니다.
 * 최근 7일 이내는 "방금 전", "N분 전", "N시간 전", "N일 전" 형식으로 표시하고,
 * 그 이전 날짜는 "YYYY-MM-DD" 형식으로 표시합니다.
 * @param date - 포맷팅할 날짜 (Date 객체)
 * @returns 포맷팅된 날짜 문자열
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  // const hoursStr = String(date.getHours()).padStart(2, "0");
  // const minutesStr = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * device ID를 가져오거나 생성합니다.
 * localStorage에 저장되어 있으면 반환하고, 없으면 새로 생성하여 저장합니다.
 * @returns device ID 문자열 (브라우저 환경이 아닌 경우 null)
 */
export function getOrCreateDeviceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  let deviceId = localStorage.getItem("device-id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device-id", deviceId);
  }
  return deviceId;
}

/**
 * 로그인 페이지로 리다이렉트합니다.
 * 현재 URL을 redirect 쿼리 파라미터로 포함시켜 로그인 후 원래 페이지로 돌아갈 수 있도록 합니다.
 * @param router - Next.js router 객체 (선택사항, 제공되면 router.push 사용, 없으면 window.location.href 사용)
 * @param customUrl - 리다이렉트할 커스텀 URL (선택사항, 기본값은 현재 전체 URL)
 */
export function redirectToLogin(
  router?: { push: (path: string) => void },
  customUrl?: string
) {
  if (typeof window === "undefined") {
    return;
  }

  // 클라이언트에서만 실행되므로 window.location을 직접 사용
  const currentUrl =
    customUrl || window.location.pathname + window.location.search;
  const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;

  if (router) {
    router.push(loginUrl);
  } else {
    window.location.href = loginUrl;
  }
}

/**
 * URL에 redirect 파라미터를 추가합니다.
 * @param basePath - 기본 경로 (예: "/login", "/signup")
 * @param redirectUrl - 리다이렉트할 URL (선택사항, pathname + 쿼리 파라미터 포함 가능)
 * @returns redirect 파라미터가 포함된 URL
 */
export function withRedirect(
  basePath: string,
  redirectUrl?: string | null
): string {
  if (!redirectUrl) {
    return basePath;
  }
  return `${basePath}?redirect=${encodeURIComponent(redirectUrl)}`;
}

/**
 * 현재 URL에서 redirect 파라미터를 가져옵니다.
 * @param searchParams - Next.js의 useSearchParams() 반환값
 * @returns redirect URL (pathname + 쿼리 파라미터 포함 가능) 또는 null
 */
export function getRedirectUrl(
  searchParams: URLSearchParams | null
): string | null {
  if (!searchParams) {
    return null;
  }
  // serchParams.get("redirect") 값을 decodeURIComponent 합니다. (디코딩 해준다는 것)
  return searchParams.get("redirect");
}

/**
 * 프로바이더 이름을 한글로 변환합니다.
 * @param provider - 프로바이더 코드 ('naver', 'kakao', 'google')
 * @returns 한글 프로바이더 이름
 */
export function getProviderDisplayName(provider: string): string {
  const providerMap: Record<string, string> = {
    naver: "네이버",
    kakao: "카카오",
    google: "구글",
  };
  return providerMap[provider] || provider;
}

/**
 * 사용자의 소셜 로그인 프로바이더 정보를 가져옵니다.
 * @param user - User 객체 (username과 authProviders 속성을 가진 객체)
 * @returns 소셜 프로바이더 한글 이름 또는 null (일반 사용자인 경우)
 */
export function getSocialProviderName(
  user: {
    username?: string | null;
    authProviders?: Array<{ provider: string }>;
  } | null
): string | null {
  if (!user) return null;

  if (user.username) {
    return null; // username이 있으면 일반 사용자
  }

  if (user.authProviders && user.authProviders.length > 0) {
    // 'local'이 아닌 프로바이더 찾기
    const socialProvider = user.authProviders.find(
      (ap) => ap.provider !== "local"
    );
    if (socialProvider) {
      return getProviderDisplayName(socialProvider.provider);
    }
  }

  return null;
}
