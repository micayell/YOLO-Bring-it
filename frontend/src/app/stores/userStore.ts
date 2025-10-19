// src/app/stores/userStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "@/shared/services/authService"; // ✅ authService import

export type UserLogin = {
  // ... (기존 UserLogin 타입)
  memberUid: number; // == memberId
  email: string;
  nickname: string;
  accessToken: string;
  refreshToken: string;
  coin: number;
  score: number;
  xp: number;
  yoloScore: number;
  firstWinCnt: number;
  secondWinCnt: number;
  thirdWinCnt: number;
  useCoin: number;
  playCnt: number;
  char2dpath: string;
  char3dpath: string;
  badgename: string;   // ✅ 로비에 표시할 배지명
  titlepath: string; // ✅ 칭호 경로 (URL)
};

type UserLoginStore = {
  // ... (기존 UserLoginStore 타입)
  userData: UserLogin | null;
  setUser: (userData: UserLogin) => void;
  clearUser: () => void;
  updateUserData: (data: Partial<UserLogin>) => void;

  setCharPaths: (paths: { char2dpath?: string; char3dpath?: string }) => void;

  // 칭호(title) 및 배지(badge) 업데이트 함수 추가
  setEquippedTitle: (path: string) => void;
  setEquippedBadge: (name: string) => void;

  initAuth: () => Promise<void>;
  isHydrated: boolean;
  setHydrated: (v: boolean) => void;
};

export const useUserLoginStore = create<UserLoginStore>()(
  persist(
    (set, get) => ({
      userData: null,
      setUser: (userData) => {
        set({ userData });
      },
      clearUser: () => set({ userData: null }),
      updateUserData: (data) => set((state) => ({
        userData: state.userData ? { ...state.userData, ...data } : null,
      })),

      setCharPaths: ({ char2dpath, char3dpath }) =>
        set((s) =>
          s.userData
            ? {
                userData: {
                  ...s.userData,
                  ...(char2dpath !== undefined ? { char2dpath } : null),
                  ...(char3dpath !== undefined ? { char3dpath } : null),
                },
              }
            : s
        ),

      // ✅ 칭호(title) 업데이트 함수
      setEquippedTitle: (path) =>
        set((s) => (s.userData ? { userData: { ...s.userData, titlepath: path } } : s)),

      // ✅ 배지(badge) 업데이트 함수
      setEquippedBadge: (name) =>
        set((s) => (s.userData ? { userData: { ...s.userData, badgename: name } } : s)),
        
      // `setBadgeName`, `setBadge`, `setTitlePath`, `setTitle` 함수들은 삭제합니다.

      isHydrated: false,
      setHydrated: (v) => set({ isHydrated: v }),

      initAuth: async () => {
        const u = get().userData;
        if (!u?.accessToken || !u?.refreshToken) return;
        
        try {
          // ✅ authService를 통해 토큰 재발급
          await authService.refreshTokenForAuth();
        } catch {
          // 에러 처리는 authService 내부에서 이루어지므로 여기서는 별도 처리 불필요
          // (자동으로 로그아웃됨)
        }
      },
    }),
    {
      name: "auth",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ userData: state.userData }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);