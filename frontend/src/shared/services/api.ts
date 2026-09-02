import axios, { AxiosError } from 'axios';
import { useUserLoginStore } from '@/domains/user/stores/userStore';

// 환경에 따라 API BASE URL 분기 처리
// 개발(DEV)일 때는 localhost, 빌드 시(production)에는 운영 서버 URL 사용
// .env 파일에 환경변수가 세팅되어 있다면 우선적으로 사용합니다.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8080/api/v1' : 'https://i13c207.p.ssafy.io/api/v1');

// WebSocket 연결을 위한 Base URL (WebSocket은 /api/v1 제외)
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8080' : 'https://i13c207.p.ssafy.io');


const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// 요청 인터셉터: 모든 요청에 Access Token 추가
apiClient.interceptors.request.use(
  (config) => {
    const { userData } = useUserLoginStore.getState();
    if (userData?.accessToken) {
      config.headers.Authorization = `Bearer ${userData.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 재발급 처리
apiClient.interceptors.response.use(
  (response) => response, // 성공적인 응답은 그대로 반환
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // 401 에러이고, 재시도한 요청이 아닐 경우
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true; // 재시도 플래그 설정
      
      try {
        // 동적 임포트를 사용하여 순환 참조(Circular Dependency)를 해결
        const { authService } = await import('@/domains/user/services/authService');
        const newAccessToken = await authService.refreshTokenForAuth();

        if (newAccessToken) {
          // 원래 요청의 헤더에 새로운 Access Token 설정
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          // 원래 요청 재시도
          console.log('🔄 원래 요청 재시도...');
          return apiClient(originalRequest);
        } else {
          // 토큰 재발급 실패 시 (refreshTokenForAuth 내부에 로그아웃 처리됨)
          return Promise.reject(new Error("토큰 재발급 실패 후 요청 중단"));
        }

      } catch (reissueError) {
        console.error('🔴 토큰 재발급 프로세스 중 심각한 오류 발생.', reissueError);
        return Promise.reject(reissueError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
