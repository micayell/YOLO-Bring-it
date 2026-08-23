import axios from 'axios';
import { authService } from '@/domains/user/services/authService';
import { useUserLoginStore } from '@/domains/user/stores/userStore';
import { API_BASE_URL } from '@/shared/services/api';

class LiveKitService {
  private baseURL: string;
  private isDev: boolean;

  constructor(baseURL: string = `${API_BASE_URL}/games`) {
    this.baseURL = baseURL;
    // 개발환경에서도 실제 백엔드 API 사용하도록 변경
    this.isDev = false; // typeof window !== 'undefined' && window.location.hostname === 'localhost';
  }

  /**
   * 백엔드 서버에 LiveKit 토큰을 요청합니다.
   * @param roomId - 접속할 방의 ID
   * @returns LiveKit 접속 토큰
   */
  async getLiveKitToken(roomId: string): Promise<string> {

    // 1. AuthService를 통한 헤더 생성 및 로그인 상태 확인
    const headers = authService.getAuthHeaders();
    const hasAuthHeader = Boolean(headers.Authorization && String(headers.Authorization).startsWith('Bearer '));
    
    
    // 개발환경에서 인증이 없으면 폴백 모드로 테스트 토큰 시도
    if (!hasAuthHeader && this.isDev) {
    } else if (!hasAuthHeader) {
      console.error("❌ 로그인되지 않음! LiveKit 토큰을 요청할 수 없습니다.");
      throw new Error("로그인이 필요합니다. 먼저 로그인을 진행해주세요.");
    }

    // Zustand 스토어에서 직접 memberUid 가져오기
    const memberUid = useUserLoginStore.getState().userData?.memberUid;
    if (!memberUid) {
      console.error("❌ memberUid를 찾을 수 없음! 스토어 상태를 확인하세요.");
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/livekit/token/${roomId}`,
        {},
        {
          headers: {
            ...headers,
            'X-MEMBER-UID': memberUid.toString(), // 스토어에서 가져온 memberUid 사용
          }
        }
      );
      
      const token = response.data.data.token;
      if (!token) {
        throw new Error('토큰이 응답에 포함되지 않았습니다.');
      }
      return token;
    } catch (error) {
      console.error('💥 LiveKit 토큰 요청 실패:', error);
      console.error('  - 에러 타입:', typeof error);
      console.error('  - 에러 메시지:', error);
      
      // 개발환경에서는 백엔드 실패 시 더미 토큰으로 폴백하지 않고 에러 발생
      // LiveKit 서버에서 유효한 토큰만 허용하므로
      throw new Error('LiveKit 토큰을 가져올 수 없습니다. 백엔드 서버를 확인하세요.');
    }
  }
}

export const livekitService = new LiveKitService();
