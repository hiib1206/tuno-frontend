import "axios";

/**
 * AxiosRequestConfig 확장
 *
 * @remarks
 * 커스텀 요청 옵션을 추가한다.
 */
declare module "axios" {
  export interface AxiosRequestConfig {
    /** 401 응답 시 로그인 페이지 리다이렉트 건너뛰기 */
    skipRedirect?: boolean;
    /** 토큰 갱신 중 순환 요청 방지 플래그 */
    _retry?: boolean;
  }
}
