import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../../shared/types/auth';
import { authService } from '../../shared/services/authService';

interface AuthActions {
  // 로그인 관련
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  socialLogin: (provider: 'kakao' | 'google', code: string, redirectUri: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // 토큰 관리
  // refreshToken: (refreshToken: string) => Promise<void>;
  setToken: (token: string) => void;
  clearAuth: () => void;
  
  // 사용자 정보
  getCurrentUser: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  
  // 상태 관리
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshTokenValue: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      // 로그인
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login({ email, password });
          
          set({
            user: response.user,
            token: response.token,
            refreshTokenValue: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // 회원가입
      register: async (email: string, password: string, name: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.register({ email, password, name });
          
          set({
            user: response.user,
            token: response.token,
            refreshTokenValue: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // 소셜 로그인
      socialLogin: async (provider: 'kakao' | 'google', code: string, redirectUri: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.socialLogin({ provider, code, redirectUri });
          
          set({
            user: response.user,
            token: response.token,
            refreshTokenValue: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '소셜 로그인에 실패했습니다.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // 로그아웃
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set(initialState);
          localStorage.removeItem('auth-storage');
        }
      },

      // 토큰 갱신
      /*refreshToken: async (refreshToken: string) => {
        try {
          const response:  = await authService.refreshTokenForAuth();
          
          set({
            token: response?.token,
            refreshTokenValue: response?.refreshToken,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          set(initialState);
          throw error;
        }
      },*/

      // 토큰 설정
      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      // 인증 정보 초기화
      clearAuth: () => {
        set(initialState);
      },

      // 현재 사용자 정보 조회
      getCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null });
          const user = await authService.getCurrentUser();
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '사용자 정보를 가져오는데 실패했습니다.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // 프로필 업데이트
      updateProfile: async (userData: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedUser = await authService.updateProfile(0, userData); // memberId 임시값
          
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // 로딩 상태 설정
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      // 에러 설정
      setError: (error: string | null) => {
        set({ error });
      },

      // 에러 초기화
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshTokenValue: state.refreshTokenValue,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 