import axios, { AxiosError } from 'axios';
import { useUserLoginStore } from '@/app/stores/userStore';
import { authService } from '@/shared/services/authService'; // ✅ authService import

const API_BASE_URL = 'https://i13c207.p.ssafy.io/api/v1';

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
        const newAccessToken = await authService.refreshTokenForAuth(); // ✅ authService 사용

        if (newAccessToken) {
          // 원래 요청의 헤더에 새로운 Access Token 설정
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          // 원래 요청 재시도
          console.log('🔄 원래 요청 재시도...');
          return apiClient(originalRequest);
        } else {
          // 토큰 재발급 실패 시 (refreshTokenForAuth 내부에서 로그아웃 처리됨)
          // 로그인 페이지로 리디렉션 또는 다른 처리
          // window.location.href = '/'; 
          return Promise.reject(new Error("토큰 재발급 실패 후 요청 중단"));
        }

      } catch (reissueError) {
        // 이 catch 블록은 refreshTokenForAuth 내부에서 처리되므로,
        // 실제로는 거의 도달하지 않지만 안전장치로 남겨둡니다.
        console.error('🔴 토큰 재발급 프로세스 중 심각한 오류 발생.', reissueError);
        return Promise.reject(reissueError);
      }
    }

    return Promise.reject(error);
  }
);


export default apiClient;
