// app/stores/itemStore.ts
import { create } from "zustand";

export interface ShopItem {
  id: string;
  name: string;
  cost?: number;
  category: "character" | "title" | "badge";
  image: string;
  description: string;
  equipped?: boolean;
}

type ItemStore = {
  items: ShopItem[];
  ownedItemIds: string[];
  selectedCategory: "character" | "title" | "badge";
  coins: number;

  setItems: (items: ShopItem[]) => void;
  setOwnedItems: (ids: string[]) => void;
  setOwnedItemsMerge: (ids: string[]) => void;
  setCategory: (c: ItemStore["selectedCategory"]) => void;
  setCoins: (coins: number) => void;

  addOwned: (id: string) => void;
  removeOwned: (id: string) => void;
  isOwned: (id: string) => boolean;

  reset: () => void;
};

export const useItemStore = create<ItemStore>((set, get) => ({
  items: [],
  ownedItemIds: [],
  selectedCategory: "character",
  coins: 0,

  setItems: (items) => set({ items }),
  setOwnedItems: (ids) => set({ ownedItemIds: [...new Set(ids.map(String))] }),
  setOwnedItemsMerge: (ids) =>
    set((s) => {
      const merged = new Set([...s.ownedItemIds, ...ids.map(String)]);
      return { ownedItemIds: Array.from(merged) };
    }),

  setCategory: (c) => set({ selectedCategory: c }),
  setCoins: (coins) => set({ coins }),

  addOwned: (id) =>
    set((s) =>
      s.ownedItemIds.includes(String(id))
        ? s
        : { ownedItemIds: [...s.ownedItemIds, String(id)] }
    ),
  removeOwned: (id) =>
    set((s) => ({
      ownedItemIds: s.ownedItemIds.filter((x) => x !== String(id)),
    })),
  isOwned: (id) => get().ownedItemIds.includes(String(id)),

  reset: () => set({ items: [], ownedItemIds: [], selectedCategory: "character", coins: 0 }),
}));
