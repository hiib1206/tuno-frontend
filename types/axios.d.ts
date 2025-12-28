import "axios";

// AxiosRequestConfig를 확장하여 skipRedirect 속성 추가
declare module "axios" {
  export interface AxiosRequestConfig {
    skipRedirect?: boolean;
    _retry?: boolean; // refresh 요청시 순환 요청 방지 플래그
  }
}
