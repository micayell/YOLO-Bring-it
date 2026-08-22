import { create } from 'zustand';

interface Invitation {
  roomId: number;
  senderId: number;
  senderNickname: string;
  message: string;
}

interface InvitationStoreState {
  invitation: Invitation | null;
  setInvitation: (invitation: Invitation | null) => void;
  clearInvitation: () => void;
}

export const useInvitationStore = create<InvitationStoreState>((set) => ({
  invitation: null,
  setInvitation: (invitation) => set({ invitation }),
  clearInvitation: () => set({ invitation: null }),
}));
