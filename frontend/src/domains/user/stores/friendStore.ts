// 타입 지정
export interface Friend {
  friendUid: number;
  memberId: number;
  nickname: string;
  avatarUrl: string;
  level?: number;
  status: 'online' | 'offline' | 'playing';
  lastSeen?: string;
  mutualFriends?: number;
}

export interface FriendRequest {
  id: number;
  memberId: number;
  nickname: string;
  avatarUrl: string;
  level?: number;
  mutualFriends?: number;
  sentAt: string;
}

export interface BlockedUser {
  memberUid: number;
  nickname: string;
  avatarUrl: string;
  blockedAt: string;
}


// Zustand로 데이터 관리
import { create } from 'zustand';

interface FriendState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  blockedUsers: BlockedUser[];

  setFriends: (friends: Friend[]) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendUid: number) => void;
  setFriendOnline: (memberId: number) => void;
  setFriendOffline: (memberId: number) => void;

  setRequests: (requests: FriendRequest[]) => void;
  removeRequest: (requestId: number) => void;

  setBlockedUsers: (users: BlockedUser[]) => void;
  blockUser: (user: BlockedUser) => void;
  unblockUser: (userId: number) => void;

  addRequest: (request: FriendRequest) => void;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  friendRequests: [],
  blockedUsers: [],

  setFriends: (friends) => set({ friends }),
  addFriend: (friend) => set((state) => ({ friends: [friend, ...state.friends] })),
  removeFriend: (friendUid) =>
    set((state) => ({
      friends: state.friends.filter((f) => f.friendUid !== friendUid),
    })),
  setFriendOnline: (memberId) =>
    set((state) => ({
      friends: state.friends.map((friend) =>
        friend.memberId === memberId ? { ...friend, status: 'online' } : friend
      ),
    })),
  setFriendOffline: (memberId) =>
    set((state) => ({
      friends: state.friends.map((friend) =>
        friend.memberId === memberId ? { ...friend, status: 'offline' } : friend
      ),
    })),

  setRequests: (requests) => set({ friendRequests: requests }),
  removeRequest: (requestId) =>
    set((state) => ({
      friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
    })),

  setBlockedUsers: (users) => set({ blockedUsers: users }),
  blockUser: (user) =>
    set((state) => ({
      blockedUsers: [...state.blockedUsers, user],
      friends: state.friends.filter((f) => f.memberId !== user.memberUid),
    })),
  unblockUser: (userId) =>
    set((state) => ({
      blockedUsers: state.blockedUsers.filter((u) => u.memberUid !== userId),
    })),

  addRequest: (request) =>
  set((state) => ({
    friendRequests: [request, ...state.friendRequests],
  })),
}));