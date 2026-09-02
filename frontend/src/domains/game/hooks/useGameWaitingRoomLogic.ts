import { useState, useEffect, useCallback, useRef } from "react";
import { useUserLoginStore } from "@/domains/user/stores/userStore";
import { useFriendStore } from "@/domains/user/stores/friendStore";
import { useGameWebSocket } from "@/domains/game/hooks/useGameWebSocket";
import { useLocalWebRTC } from "@/domains/game/hooks/useLocalWebRTC";
import apiClient from "@/shared/services/api";
import type { Player, ChatMessage } from "@/shared/types/game";
import { toast } from "sonner";

interface UseGameWaitingRoomLogicProps {
  gameMode: "quick" | "custom";
  onStartGame: (players: Player[], roomUid: number) => void;
  onBack: () => void;
  invitedRoomId?: number;
}

export function useGameWaitingRoomLogic({ gameMode, onStartGame, onBack, invitedRoomId }: UseGameWaitingRoomLogicProps) {
  const { userData } = useUserLoginStore();
  const { friends, setFriends } = useFriendStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomLeaderId, setRoomLeaderId] = useState<string | null>(null);
  const [canStartGame, setCanStartGame] = useState(false);
  const effectRan = useRef(false);

  const fetchParticipants = useCallback(async (currentRoomId: number) => {
    if (!userData?.accessToken) return;
    try {
      console.log(`📡 방(${currentRoomId}) 참가자 목록 API 호출...`);
      const response = await apiClient.get(`/games/rooms/${currentRoomId}/roster`);
      
      if (response.data && response.data.members) {
        const fetchedPlayers = response.data.members.map((p: any) => ({
          id: p.memberUid.toString(),
          name: p.nickname,
          avatar: `https://api.dicebear.com/8.x/pixel-art/svg?seed=${p.nickname}`,
          totalScore: 0,
          roundScores: [],
          isCurrentUser: p.memberUid === userData.memberUid,
          isReady: p.isReady ?? false,
        }));
        setPlayers(fetchedPlayers);
        console.log('✅ 참가자 목록 초기화 성공:', fetchedPlayers);
      }
    } catch (error) {
      console.error('❌ 참가자 목록 불러오기 실패:', error);
      toast.error('참가자 목록을 불러오는 중 오류가 발생했습니다.');
    }
  }, [userData]);

  const {
    videoRef: localVideoRef,
    isAudioEnabled: isMicEnabled,
    isVideoEnabled: isWebcamEnabled,
    startVideo,
    stopVideo,
    toggleAudio: handleToggleMic,
    toggleVideo: handleToggleWebcam,
  } = useLocalWebRTC();

  const { sendMessage } = useGameWebSocket({
    roomId: roomId ?? undefined,
    onParticipantEvent: (data) => {
      console.log('🔄 Participant event:', data);
      if (!data || !data.type || !data.memberId) {
        console.error('유효하지 않은 참가자 이벤트 데이터:', data);
        return;
      }
      setPlayers(prevPlayers => {
        if (data.type === 'JOINED') {
          if (prevPlayers.find(p => p.id === data.memberId.toString())) {
            return prevPlayers;
          }
          const newUser: Player = {
            id: data.memberId.toString(),
            name: data.nickname,
            avatar: `https://api.dicebear.com/8.x/pixel-art/svg?seed=${data.nickname}`,
            isCurrentUser: data.memberId === userData?.memberUid,
            isReady: false,
            totalScore: 0,
            roundScores: [],
          };
          return [...prevPlayers, newUser];
        }
        if (data.type === 'LEFT') {
          return prevPlayers.filter(p => p.id !== data.memberId.toString());
        }
        return prevPlayers;
      });
    },
    onRosterChange: (data) => {
      console.log('🔄 Roster update:', data);
      if (data && Array.isArray(data.members)) {
        const newPlayers = data.members.map((p: any) => ({
          id: p.memberUid.toString(),
          name: p.nickname,
          avatar: `https://api.dicebear.com/8.x/pixel-art/svg?seed=${p.nickname}`,
          isCurrentUser: p.memberUid === userData?.memberUid,
          isReady: p.isReady ?? false,
          totalScore: 0,
          roundScores: [],
        }));
        setPlayers(newPlayers);
      } else {
        console.error('유효하지 않은 명단 데이터:', data);
      }
    },
    onReadyStatus: (data) => {
      if (data && typeof data.memberId !== 'undefined' && typeof data.ready !== 'undefined') {
        console.log("star", data);
        setPlayers(prevPlayers =>
          prevPlayers.map(p =>
            p.id === data.memberId.toString() ? { ...p, isReady: data.ready } : p
          )
        );
      } else {
        console.error('유효하지 않은 준비상태 데이터:', data);
      }
    },
    onCanStart: (data) => {
      if (data && typeof data.canStart !== 'undefined') {
        console.log("pp", data);
        setCanStartGame(data.canStart);
      } else {
        console.error('유효하지 않은 게임 시작 가능 데이터:', data);
      }
    },
    onChatMessage: (data) => {
      if (data && data.senderNickname && data.content && data.timestamp) {
        setMessages((prev) => [...prev, {
          id: Date.now() + Math.random(),
          user: data.senderNickname,
          message: data.content,
          timestamp: new Date(data.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
          type: "user",
        }]);
      } else {
        console.error('유효하지 않은 채팅 메시지 데이터:', data);
      }
    },
  });

  const createRoom = useCallback(async () => {
    if (!userData?.accessToken) return;
    try {
      const roomTypeValue = gameMode === 'quick' ? 'random' : 'custom';
      const response = await apiClient.post(`/games/rooms`, {
        roomType: roomTypeValue,
        roundNum: 5
      }, {
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      });
      if (response.status !== 200 && response.status !== 201) {
        console.error("Error creating room: status != 200/201");
        toast.error("방 생성을 실패했습니다. 다시 시도해 주세요.");
        return;
      }
      const result = response.data;
      if (result.data && result.data.roomUid) {
        setRoomId(result.data.roomUid);
        setMessages([{
          id: Date.now(),
          user: "System",
          message: `방이 생성되었습니다! (ID: ${result.data.roomUid})`,
          timestamp: new Date().toLocaleTimeString(),
          type: "system",
        }]);
      } else {
        console.error("Error creating room: No room ID");
        toast.error('방을 생성하는 데 실패했습니다. 다시 시도해 주세요.');
        return;
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error('방을 생성하는 데 실패했습니다. 다시 시도해 주세요.');
    }
  }, [gameMode, userData?.accessToken]);

  const handleSendMessage = useCallback(() => {
    if (message.trim() && sendMessage) {
      sendMessage(message.trim());
      setMessage("");
    }
  }, [message, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleToggleReady = async () => {
    if (!roomId || !userData?.accessToken) return;
    try {
      await apiClient.post(`/games/rooms/ready/toggle`, { roomId }, {
        headers: {
          "Authorization": `Bearer ${userData.accessToken}`,
        },
      });
    } catch (error) {
      console.error("준비 상태 변경 중 오류 발생:", error);
      toast.error('준비 상태를 변경하는 데 실패했습니다.');
    }
  };

  const handleInviteFriend = async (friendId: string) => {
    if (players.some(p => p.id === friendId)) {
        toast.error('이미 방에 초대되었거나 참여 중인 친구입니다.');
        return;
    }
    if (!roomId || !userData?.accessToken || !userData?.memberUid) {
      console.error('초대 실패: 방 정보 또는 사용자 정보가 없습니다.');
      return;
    }
    try {
      await apiClient.post(`/games/rooms/${roomId}/invitation`,
        { receiverId: Number(friendId) },
        {
          headers: {
            'X-MEMBER-UID': userData.memberUid.toString(),
          },
        }
      );
      console.log(`✅ ${friendId}님을 성공적으로 초대했습니다.`);
      toast.success(`${friendId}님을 초대했습니다!`);
    } catch (error) {
      console.error(`❌ ${friendId}님을 초대하는 중 오류 발생:`, error);
      toast.error(`${friendId}님을 초대하는 데 실패했습니다.`);
    }
  };

  const handleStartGame = async () => {
    if (!roomId || !canStartGame || !userData) return;
    try {
      const response = await apiClient.patch(`/games/rooms/${roomId}/status/starting`, {}, {
        headers: {
          'Authorization': `Bearer ${userData.accessToken}`,
        },
      });
      if (response.status !== 200) {
        console.error("게임 시작 중 오류 발생: status != 200");
        toast.error('게임을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      onStartGame(players, roomId);
    } catch (error) {
      console.error("게임 시작 중 오류 발생:", error);
      toast.error('게임을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleLeaveRoom = useCallback(async () => {
    if (!roomId) {
      toast.error("현재 방 정보가 없어 나갈 수 없습니다.");
      onBack();
      return;
    }
    try {
      await apiClient.delete(`/games/rooms/leave`, {
        data: { roomId },
        headers: {
          'Authorization': `Bearer ${userData?.accessToken}`,
        },
      });
      toast.success("방에서 나왔습니다.");
      onBack();
    } catch (error) {
      console.error("방 나가기 처리 중 오류 발생:", error);
      toast.error("방을 나가는 중 오류가 발생했습니다.");
      onBack();
    }
  }, [roomId, onBack, userData?.accessToken]);

  useEffect(() => {
    if (effectRan.current) return;
    if (invitedRoomId) {
      console.log(`✉️ 초대를 통해 방 ${invitedRoomId}에 입장합니다.`);
      setRoomId(invitedRoomId);
      setMessages([{
        id: Date.now(),
        user: "System",
        message: `초대를 통해 방에 참여했습니다! (ID: ${invitedRoomId})`,
        timestamp: new Date().toLocaleTimeString(),
        type: "system",
      }]);
    } else if (userData?.accessToken) {
      createRoom();
    }
    return () => {
      effectRan.current = true;
    };
  }, [createRoom, userData?.accessToken, invitedRoomId]);

  useEffect(() => {
    if (roomId) {
      fetchParticipants(roomId);
    }
  }, [roomId, fetchParticipants]);

  useEffect(() => {
    if (userData && userData.memberUid) {
      const self = {
        id: userData.memberUid.toString(),
        name: userData.nickname || "나",
        avatar: `https://api.dicebear.com/8.x/pixel-art/svg?seed=${userData.nickname || 'Me'}`,
        totalScore: 0,
        roundScores: [],
        isCurrentUser: true,
        isReady: false,
      };
      setPlayers([self]);
      setRoomLeaderId(self.id);
    }
  }, [userData]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!userData?.accessToken || !userData?.memberUid) return;
      try {
        console.log('📡 친구 목록 API 호출 시작 (최초 1회)...');
        const response = await apiClient.get('/users/friends', {
          headers: {
            'Authorization': `Bearer ${userData.accessToken}`,
            'X-MEMBER-UID': userData.memberUid.toString(),
          },
        });
        if (!response.data?.data) {
          setFriends([]);
          return;
        }
        const friendsData = response.data.data.map((friend: any) => ({
          friendUid: friend.friendUid,
          memberId: friend.memberId,
          id: friend.memberId.toString(),
          nickname: friend.nickname,
          status: (friend.online || friend.isOnline) ? 'online' : 'offline',
          avatarUrl: `https://api.dicebear.com/8.x/pixel-art/svg?seed=${friend.nickname}`,
          level: friend.level || 1,
          mutualFriends: friend.mutualFriends || 0,
        }));
        setFriends(friendsData);
        console.log('✅ 친구 목록 초기화 성공:', friendsData);
      } catch (error) {
        console.error('❌ 친구 목록 불러오기 실패:', error);
        toast.error('친구 목록을 불러오는 데 실패했습니다.');
      }
    };
    fetchFriends();
  }, [userData?.accessToken, userData?.memberUid, setFriends]);

  const currentUser = players.find((p) => p.isCurrentUser);
  const gameStartTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (canStartGame) {
      gameStartTimerRef.current = setTimeout(() => {
        handleStartGame();
      }, 3000);
    } else {
      if (gameStartTimerRef.current) {
        clearTimeout(gameStartTimerRef.current);
        gameStartTimerRef.current = null;
      }
    }
    return () => {
      if (gameStartTimerRef.current) {
        clearTimeout(gameStartTimerRef.current);
      }
    };
  }, [canStartGame, handleStartGame]);

  useEffect(() => {
    if (currentUser) {
      startVideo();
    }
    return () => {
      stopVideo();
    };
  }, [currentUser, startVideo, stopVideo]);

  return {
    players,
    roomId,
    message,
    setMessage,
    messages,
    roomLeaderId,
    canStartGame,
    friends,
    localVideoRef,
    isMicEnabled,
    isWebcamEnabled,
    handleToggleMic,
    handleToggleWebcam,
    handleSendMessage,
    handleKeyPress,
    handleToggleReady,
    handleInviteFriend,
    handleStartGame,
    handleLeaveRoom,
    currentUser,
  };
}