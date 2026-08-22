import apiClient from '@/shared/services/api';
import { useUserLoginStore } from '@/domains/user/stores/userStore'; // ✅ userStore import
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  User
} from '@/shared/types/auth';
import type { AxiosRequestHeaders } from 'axios';

class AuthService {
  // ❌ 내부 상태와 생성자 제거: 더 이상 자체적으로 토큰을 관리하지 않음
  // private accessToken: string | null = null;
  // private refreshToken: string | null = null;
  //
  // constructor() {
  //   this.accessToken = localStorage.getItem('accessToken');
  //   this.refreshToken = localStorage.getItem('refreshToken');
  // }

  // ✅ 인증 헤더 가져오기 (userStore 사용)
  getAuthHeaders(): AxiosRequestHeaders {
    const { userData } = useUserLoginStore.getState();
    const token = userData?.accessToken;
    if (token) {
      return { 'Authorization': `Bearer ${token}` } as AxiosRequestHeaders;
    }
    return {} as AxiosRequestHeaders;
  }

  // ❌ 토큰 저장/제거 메서드 제거: userStore가 담당
  // setTokens(accessToken: string, refreshToken: string) { ... }
  // clearTokens() { ... }

  // 로그인: 성공 시 userStore에 사용자 데이터 저장
  async login(credentials: LoginRequest): Promise<any> {
    const res = await apiClient.post(`/users/tokens/login`, credentials);
    const responseData = res?.data?.data;
    
    if (responseData) {
      const { accessToken, refreshToken, memberInfo } = responseData;
      const { email, ...restMemberInfo } = memberInfo;
      
      const user = {
        accessToken,
        refreshToken,
        email,
        ...restMemberInfo
      };
      
      useUserLoginStore.getState().setUser(user);
    }
    
    return responseData;
  }

  // 회원가입
  async signUp(userData: RegisterRequest): Promise<any> {
    const res = await apiClient.post(`/users/users`, userData);
    return res.data;
  }

  // 이메일 인증 코드 발송
  async sendVerificationCode(email: string) {
    await apiClient.post(`/users/tokens/signup/email`, { email });
  }

  // 이메일 인증 코드 검증
  async verifyCode(email: string, code: string) {
    const res = await apiClient.post(`/users/tokens/verification`, { email, code });
    return res.data;
  }

  // 로그아웃: userStore의 clearUser 호출
  async logout() {
    try {
      await apiClient.post(`/users/tokens/logout`, {});
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      // ✅ userStore의 clearUser를 사용하여 상태 초기화
      useUserLoginStore.getState().clearUser();
    }
  }

  // 회원 탈퇴
  async withdraw(): Promise<void> {
    try {
      await apiClient.patch(
        `/users/users/withdraw`,
        {},
        { headers: this.getAuthHeaders() }
      );
      // 성공 시 userStore에서 사용자 정보 제거
      useUserLoginStore.getState().clearUser();
    } catch (error) {
      console.error('Withdrawal failed:', error);
      // 백엔드에서 오는 에러 메시지를 전달하기 위해 re-throw
      throw error;
    }
  }

  // 친구 목록
  async getFriends() {
    const res = await apiClient.get(`/users/friends`);
    return res.data;
  }

  // 특정 유저 프로필 조회
  async getProfile(memberId: number): Promise<any> {
    try {
      const response = await apiClient.get(
        `/users/users/${memberId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  }

  // 친구 삭제
  async removeFriend(friendId: number) {
    const res = await apiClient.delete(`/users/friends/${friendId}`);
    return res.data;
  }

  // 차단 토글
  async toggleBlockUser(memberId: number) {
    const res = await apiClient.put(`/users/blocked-members/${memberId}/toggle`);
    return res.data;
  }

  // 유저 검색
  async searchUsers(keyword: string): Promise<any> {
    try {
      const response = await apiClient.get(
        `/users/users/search?keyword=${encodeURIComponent(keyword)}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Search users failed:', error);
      throw error;
    }
  }

  // 친구 요청
  async sendFriendRequest(receiverId: number) {
    const res = await apiClient.post(`/users/friends/${receiverId}`, {});
    return res.data;
  }

  // 업적 목록
  async getAchievements() {
    const res = await apiClient.get(`/users/achievements`);
    return res.data;
  }

  // 현재 사용자 정보 조회 (백엔드에 해당 API 없음, 추후 구현 필요)
  async getCurrentUser(): Promise<User | null> {
    // try {
    //   const response = await apiClient.get(
    //     `/members/me`, // 예시 URL
    //     { headers: this.getHeaders() }
    //   );
    //   return response.data.data;
    // } catch (error) {
    //   console.error('Get current user failed:', error);
    //   return null;
    // }
    console.warn('getCurrentUser is not implemented on the backend yet.');
    return Promise.resolve(null);
  }

  // 회원가입 (AuthStore에서 사용)
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.signUp(userData);
  }

  // 소셜 로그인 (AuthStore에서 사용)
  async socialLogin(_params: { provider: string; code: string; redirectUri: string }): Promise<AuthResponse> {
    // 소셜 로그인 구현 필요 시 여기에 추가
    throw new Error('소셜 로그인이 아직 구현되지 않았습니다.');
  }

  // 사용자 정보 업데이트
  async updateProfile(memberId: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put(
        `/users/users/${memberId}`,
        userData,
        { headers: this.getAuthHeaders() }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw new Error('프로필 업데이트에 실패했습니다.');
    }
  }

  // ✅ 토큰 재발급 로직 통합
  async refreshTokenForAuth(): Promise<string | null> {
    const { userData, setUser, clearUser } = useUserLoginStore.getState();
    const refreshToken = userData?.refreshToken;

    if (!refreshToken) {
      clearUser();
      return null;
    }

    try {
      console.log('🔄 Access Token 재발급 시도...');
      const response = await apiClient.post(`/users/tokens/reissue`, {
        refreshToken: refreshToken,
      });

      const newAccessToken = response.data.data.accessToken;

      if (!newAccessToken) {
        throw new Error("새로운 Access Token을 받지 못했습니다.");
      }

      console.log('✅ 토큰 재발급 성공!');

      if(userData) {
        setUser({
          ...userData,
          accessToken: newAccessToken,
        });
      }
      return newAccessToken;

    } catch (reissueError) {
      console.error('🔴 Refresh Token 만료 또는 재발급 실패, 강제 로그아웃 처리.', reissueError);
      clearUser();
      return null;
    }
  }
}

export const authService = new AuthService();
