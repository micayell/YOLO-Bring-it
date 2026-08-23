import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useUserLoginStore } from '@/domains/user/stores/userStore';
import { useWebSocketStore } from '@/app/stores/websocketStore';
import { WS_BASE_URL } from '@/shared/services/api';

export const useGlobalWebSocket = () => {
  const { userData } = useUserLoginStore();
  const { setClient, setIsConnected, setInvitation } = useWebSocketStore();

  useEffect(() => {
    // 사용자가 로그인한 경우에만 웹소켓 연결을 설정
    if (userData?.accessToken && userData?.memberUid) {
      // 이미 연결된 클라이언트가 있는 경우 중복 생성 방지
      if (useWebSocketStore.getState().client) {
        return;
      }

      console.log('📣 [GlobalSocket] 연결 시도...');

      const newClient = new Client({
        webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws-game`),
        connectHeaders: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
        debug: (msg) => console.log('📣 [GlobalSocket] STOMP Debug:', msg),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          console.log('✅ [GlobalSocket] 연결 성공');
          setIsConnected(true);

          // 개인 초대 메시지 구독
          newClient.subscribe(`/topic/participants/${userData.memberUid}`, (message) => {
            try {
              const invitationData = JSON.parse(message.body);
              console.log('💌 [GlobalSocket] 새로운 게임 초대 수신:', invitationData);
              setInvitation(invitationData);
            } catch (error) {
              console.error('[GlobalSocket] 초대 메시지 파싱 실패:', error);
            }
          });
        },
        onStompError: (frame) => {
          console.error('🔴 [GlobalSocket] STOMP 에러:', frame);
          setIsConnected(false);
        },
        onWebSocketClose: () => {
          console.log('🔌 [GlobalSocket] 연결 종료');
          setIsConnected(false);
          setClient(null); // 예기치 않은 종료 시 클라이언트 상태 초기화
        },
      });

      // 스토어에 클라이언트 인스턴스 저장 후 활성화
      setClient(newClient);
      newClient.activate();

      // 이 cleanup 함수는 사용자가 로그아웃하거나 앱을 닫을 때 실행됩니다.
      return () => {
        const clientToDeactivate = useWebSocketStore.getState().client;
        if (clientToDeactivate) {
          console.log('📴 [GlobalSocket] 연결 해제 중...');
          clientToDeactivate.deactivate();
          setClient(null);
          setIsConnected(false);
        }
      };
    }
    // 사용자가 로그아웃하면 위의 cleanup 함수가 자동으로 호출되어 연결이 해제됩니다.
  }, [userData, setClient, setIsConnected, setInvitation]);
};
