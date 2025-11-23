import axios from "axios";

// AxiosRequestConfig를 확장하여 skipRedirect 속성 추가
declare module "axios" {
  export interface AxiosRequestConfig {
    skipRedirect?: boolean;
  }
}
