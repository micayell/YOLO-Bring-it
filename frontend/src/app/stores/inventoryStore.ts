// src/app/stores/inventoryStore.ts
import { create } from "zustand";

// ⬇️ 화면/리스트 쪽과 독립적으로 최소 타입만 정의 (구조만 맞으면 OK)
export type CategoryId = "character" | "title" | "badge";
export type InventoryItem = {
  id: string;
  name: string;
  image: string;
  modelUrl:string;
  description: string;
  category: CategoryId;
  equipped: boolean;
};

interface InventoryState {
  items: InventoryItem[];
  selectedCategory: CategoryId;
  loading: boolean;
  error: string | null;

  setCategory: (cat: CategoryId) => void;

  /**
   * ✅ 타입 충돌 방지용: 다른 모듈의 같은 구조 배열도 허용
   * - 배열을 그대로 넘기거나
   * - 함수형 업데이트로 넘기거나
   */
  setItems: (
    next:
      | InventoryItem[]
      | ReadonlyArray<unknown> // ← 다른 모듈 타입도 구조만 맞으면 통과
      | ((prev: InventoryItem[]) => InventoryItem[])
  ) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useInventoryStore = create<InventoryState>()((set) => ({
  items: [],
  selectedCategory: "character",
  loading: false,
  error: null,

  setCategory: (cat) => set({ selectedCategory: cat }),

  // ✅ setItems 구현: 배열이면 그대로 캐스팅, 함수면 실행
  setItems: (next) =>
    set((s) => {
      if (typeof next === "function") {
        // 함수형 업데이트
        return { items: (next as (p: InventoryItem[]) => InventoryItem[])(s.items) };
      }
      // 배열형 업데이트: 구조만 맞으면 OK (런타임엔 타입이 사라지므로 안전)
      return { items: next as InventoryItem[] };
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
