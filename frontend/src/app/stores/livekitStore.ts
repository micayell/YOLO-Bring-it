import { create } from 'zustand';
import { Room, RemoteParticipant, TrackPublication } from 'livekit-client';

// LiveKit 상태 관리 스토어

interface LiveKitState {
  // 상태
  room: Room | null;
  participants: Map<string, RemoteParticipant>; // 배열에서 Map으로 변경
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  
  // 설정
  livekitUrl: string; // LiveKit 서버 (ws) URL
  token: string | null;

  // 액션
  setRoom: (room: Room) => void;
  setParticipants: (participants: RemoteParticipant[]) => void;
  addParticipant: (participant: RemoteParticipant) => void;
  removeParticipant: (participant: RemoteParticipant) => void;
  updateParticipant: (participant: RemoteParticipant, publication: TrackPublication) => void; // 참가자 업데이트 액션 추가
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setLivekitUrl: (url: string) => void;
  setToken: (token: string) => void;
  reset: () => void;
}

const initialState = {
  room: null,
  participants: new Map(), // 초기값을 빈 Map으로 변경
  isConnecting: false,
  isConnected: false,
  error: null,
  // LiveKit Cloud WebSocket 주소
  livekitUrl: 'wss://yolo-bring-it-m8gn7i58.livekit.cloud',
  token: null,
};

export const useLiveKitStore = create<LiveKitState>((set, get) => ({
  ...initialState,
  
  setRoom: (room) => set({ room }),
  
  setParticipants: (participants) => {
    const participantMap = new Map<string, RemoteParticipant>();
    participants.forEach(p => participantMap.set(p.sid, p));
    set({ participants: participantMap });
  },

  addParticipant: (participant) => {
    console.log('➕ 참가자 추가:', participant.identity, participant.sid);
    set((state) => {
      const newParticipants = new Map(state.participants);
      newParticipants.set(participant.sid, participant);
      console.log('👥 총 참가자 수:', newParticipants.size);
      return { participants: newParticipants };
    });
  },

  removeParticipant: (participant) => {
    console.log('➖ 참가자 제거:', participant.identity, participant.sid);
    set((state) => {
      const newParticipants = new Map(state.participants);
      newParticipants.delete(participant.sid);
      console.log('👥 총 참가자 수:', newParticipants.size);
      return { participants: newParticipants };
    });
  },
  
  updateParticipant: (participant, publication) => {
    console.log('🔄 참가자 정보 업데이트:', participant.identity, publication.trackSid);
    set(state => {
      const newParticipants = new Map(state.participants);
      newParticipants.set(participant.sid, participant);
      return { participants: newParticipants };
    });
  },
  
  setConnecting: (isConnecting) => set({ isConnecting }),
  
  setConnected: (isConnected) => set({ isConnected }),
  
  setError: (error) => set({ error }),
  
  setLivekitUrl: (livekitUrl) => set({ livekitUrl }),

  setToken: (token) => set({ token }),
  
  reset: () => {
    const { room } = get();
    if (room) {
      room.disconnect();
    }
    set(initialState);
  },
}));
