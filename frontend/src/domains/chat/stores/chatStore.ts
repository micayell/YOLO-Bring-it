import { create } from "zustand";

interface ChatModalInfo {
  peerId: number;
  nickname: string;
  open: boolean;
}

interface ChatStore {
  chatModal: ChatModalInfo | null;
  openChat: (peerId: number, nickname: string) => void;
  closeChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chatModal: null,
  openChat: (peerId, nickname) =>
    set({ chatModal: { peerId, nickname, open: true } }),
  closeChat: () => set({ chatModal: null }),
}));