// src/app/stores/achievementStore.ts
import { create } from "zustand";
import { useItemStore } from "@/app/stores/itemStore"; // ✅ 인벤토리 스토어 불러오기

export type ItemCategory = {
  categoryCode: string;
  name: string;
};

export type Item = {
  itemUid: number;
  name: string;
  cost: number | null;
  itemCategory: ItemCategory;
};

export type AchievementCore = {
  achievementUid: number;
  name: string;
  exp: string;
  item: Item;
  hasAchievement: boolean;
};

type State = {
  achievements: AchievementCore[];
  achievementRate: number; // 0~100
  loading: boolean;
  error: string;
};

type Actions = {
  setAchievements: (list: AchievementCore[], rate?: number) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string) => void;
  clear: () => void;

  /** ✅ BAD 배지 동기화용 액션 */
  syncBadBadgesToInventory: () => void;
};

export const useAchievementStore = create<State & Actions>((set) => ({
  achievements: [],
  achievementRate: 0,
  loading: false,
  error: "",

  setAchievements: (list, rate = 0) => {
    set({
      achievements: Array.isArray(list) ? list : [],
      achievementRate: Math.max(0, Math.min(100, rate)),
      loading: false,
      error: "",
    });

    // ✅ setAchievements가 불릴 때마다 BAD 배지 동기화
    get().syncBadBadgesToInventory();
  },

  setLoading: (v) => set({ loading: v }),
  setError: (msg) => set({ error: msg, loading: false }),
  clear: () => set({ achievements: [], achievementRate: 0, loading: false, error: "" }),

  syncBadBadgesToInventory: () => {
    const list = get().achievements;
    const badIds = list
      .filter(
        (a) => a.hasAchievement && a.item?.itemCategory?.categoryCode === "BAD"
      )
      .map((a) => String(a.item.itemUid));

    if (badIds.length > 0) {
      useItemStore.getState().setOwnedItemsMerge(badIds);
    }
  },
}));
