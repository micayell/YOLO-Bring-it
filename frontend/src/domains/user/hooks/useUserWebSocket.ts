import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useUserLoginStore } from '@/domains/user/stores/userStore';
import { useFriendStore } from '@/domains/user/stores/friendStore';
import apiClient, { WS_BASE_URL } from '@/shared/services/api'; // apiClient import
import { toast } from 'sonner';

// user-service의 웹소켓 엔드포인트
const USER_SOCKET_URL = `${WS_BASE_URL}/ws-user`;

export const useUserWebSocket = () => {
  const { userData } = useUserLoginStore();
  const { setFriendOnline, setFriendOffline, addFriend, addRequest } = useFriendStore();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      if (!userData?.accessToken || !userData?.memberUid) {
        if (clientRef.current?.connected) {
          console.log('🛑 [FriendSocket] 연결 해제 (로그아웃)');
          clientRef.current.deactivate();
          clientRef.current = null;
        }
        return;
      }    

      if (clientRef.current?.connected) {
        return;
      }

      try {
        // 웹소켓 연결 전 토큰 유효성 검사 및 재발급 트리거
        console.log('🛡️ [FriendSocket] 웹소켓 연결 전 토큰 유효성 검사...');
        await apiClient.get('/users/users/health-check');
        console.log('✅ [FriendSocket] 토큰 유효성 확인 완료.');

        // 토큰 재발급 후 최신 토큰 정보를 다시 가져옴
        const freshUserData = useUserLoginStore.getState().userData;
        if (!freshUserData?.accessToken) {
          console.error('🔴 [FriendSocket] 유효한 토큰이 없어 연결을 중단합니다.');
          return;
        }

        const client = new Client({
          webSocketFactory: () => new SockJS(USER_SOCKET_URL),
          connectHeaders: {
            Authorization: `Bearer ${freshUserData.accessToken}`, // 최신 토큰 사용
          },
          debug: (msg) => console.log('📣 [FriendSocket] STOMP Debug:', msg),
          reconnectDelay: 5000,
          onConnect: () => {
            console.log('✅ [UserSocket] user-service 웹소켓 연결 성공');

            // 1. 친구 온라인 상태 변경 구독
            client.subscribe('/topic/friends/online-status', (message) => {
              try {
                const statusUpdate = JSON.parse(message.body);
                console.log('🔔 [UserSocket] 친구 상태 변경 수신:', statusUpdate);
                if (statusUpdate.isOnline) {
                  setFriendOnline(statusUpdate.memberId);
                } else {
                  setFriendOffline(statusUpdate.memberId);
                }
              } catch (error) {
                console.error('[UserSocket] 친구 상태 메시지 파싱 실패:', error);
              }
            });

            // 2. 업적 달성, 친구 요청/수락 등 개인 알림 구독
            if (freshUserData?.memberUid) {
              // 업적 구독
              client.subscribe(`/topic/achievement/${freshUserData.memberUid}`, (message) => {
                try {
                  const achievement = JSON.parse(message.body);
                  console.log('🏆 [UserSocket] 업적 달성 알림 수신:', achievement);
                  toast.success(`✨ 업적 달성: ${achievement.achievementName} (+${achievement.achievementExp} EXP)`);
                } catch (error) {
                  console.error('[UserSocket] 업적 알림 메시지 파싱 실패:', error);
                }
              });

              // 친구 관련 구독
              client.subscribe(`/topic/friends/${freshUserData.memberUid}`, (message) => {
                try {
                  const data = JSON.parse(message.body);
                  console.log('💌 [UserSocket] 친구 관련 알림 수신:', data);

                  if (data.message?.includes('님이 친구 요청을 보냈습니다.')) {
                    // 새로운 친구 요청
                    toast.info(`💌 ${data.senderNickname}님으로부터 친구 요청!`);
                    addRequest({
                      id: data.senderId, // 백엔드에서 friendshipId가 따로 오지 않으므로 senderId를 임시 id로 사용
                      memberId: data.senderId,
                      nickname: data.senderNickname,
                      avatarUrl: `https://api.dicebear.com/8.x/pixel-art/svg?seed=${data.senderNickname}`,
                      sentAt: new Date().toISOString(),
                    });
                  } else if (data.message?.includes('님이 친구 요청을 수락했습니다.')) {
                    // 친구 요청 수락됨
                    toast.success(`🎉 ${data.senderNickname}님과 친구가 되었습니다!`);
                    addFriend({
                      friendUid: data.senderId,
                      memberId: data.senderId,
                      nickname: data.senderNickname,
                      avatarUrl: `https://api.dicebear.com/8.x/pixel-art/svg?seed=${data.senderNickname}`,
                      status: 'online', // 온라인으로 가정
                    });
                  }
                } catch (error) {
                  console.error('[UserSocket] 친구 관련 알림 처리 실패:', error);
                }
              });
            }
          },
          onStompError: (frame) => {
            console.error('🔴 [UserSocket] STOMP 에러:', frame.headers['message'], frame);
          },
        });

        console.log('🚀 [FriendSocket] 웹소켓 활성화 시도...');
        client.activate();
        clientRef.current = client;
      } catch (error) {
        console.error('🔴 [FriendSocket] 토큰 검증 또는 웹소켓 연결 과정에서 에러 발생:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (clientRef.current?.connected) {
        console.log('🛑 [FriendSocket] 컴포넌트 언마운트로 연결 해제');
        clientRef.current.deactivate();
      }
    };
  }, [userData?.memberUid, setFriendOnline, setFriendOffline, addFriend, addRequest]);
};
