import { useEffect, useRef, useCallback } from 'react';
import { useWebSocketStore } from '@/app/stores/websocketStore';
import { IMessage, StompSubscription } from '@stomp/stompjs';

interface GameSocketConfig {
  roomId?: number;
  onParticipantEvent?: (data: any) => void;
  onRosterChange?: (data: any) => void;
  onReadyStatus?: (data: any) => void;
  onCanStart?: (data: any) => void;
  onChatMessage?: (data: any) => void;
  onRoundIntro?: (data: any) => void;
  onRoundEnd?: (data: any) => void;
  onGameScore?: (data: any) => void;
  onError?: (error: any) => void;
}

type Sub = StompSubscription | null;

const now = () => new Date().toISOString().split('T')[1]!.replace('Z', '');
const tag = 'GameSocket';
const log = (...args: any[]) => console.log(`[${now()}] [${tag}]`, ...args);
const warn = (...args: any[]) => console.warn(`[${now()}] [${tag}] ⚠️`, ...args);
const err = (...args: any[]) => console.error(`[${now()}] [${tag}] ❌`, ...args);

function safeJSON<T = any>(body: string, where: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch (e) {
    err(`JSON parse 실패 @${where}:`, e, '\n원본:', body);
    return null;
  }
}

function makeTopic(roomId: number, path: string) {
  return `/topic/${path.replace(':roomId', String(roomId))}`;
}

export const useGameWebSocket = (config?: GameSocketConfig) => {
  const { roomId } = config || {};
  const { client, isConnected } = useWebSocketStore();
  const savedHandlers = useRef(config);
  const subsRef = useRef<Sub[]>([]);

  // 최신 핸들러 유지 (렌더링 될 때마다 참조 업데이트)
  useEffect(() => {
    savedHandlers.current = config;
  }, [config]);

  // 구독/해제 유틸
  const unsubscribeAll = useCallback((reason: string) => {
    if (!subsRef.current?.length) return;
    log(`🧹 구독 해제(${reason}) - count=${subsRef.current.length}`);
    subsRef.current.forEach((s) => {
      try { s?.unsubscribe(); } catch (e) { warn('구독 해제 중 오류:', e); }
    });
    subsRef.current = [];
  }, []);

  const subscribe = useCallback((destination: string, handler: (msg: IMessage) => void) => {
    if (!client) {
      warn('subscribe 실패: client 없음', destination);
      return null;
    }
    try {
      log('🔔 SUB', destination);
      const sub = client.subscribe(destination, handler);
      subsRef.current.push(sub);
      return sub;
    } catch (e) {
      err('SUB 실패:', destination, e);
      savedHandlers.current?.onError?.(e);
      return null;
    }
  }, [client]);

  // 메인 구독 effect
  useEffect(() => {
    // 연결 가드
    if (!client) { log('⏸️ 대기: client 없음'); return; }
    if (!isConnected || !client.connected) { log('⏸️ 대기: STOMP 미연결'); return; }
    if (!roomId) { log('⏸️ 대기: roomId 없음'); return; }

    log(`✅ 구독 시작 (roomId=${roomId}) connected=${client.connected}`);

    // 중복 구독 방지(이전 구독 모두 해제)
    unsubscribeAll('re-subscribe');

    // --- 구독 세트 ---
    // ✅ 대기방 관련
    subscribe(makeTopic(roomId, 'room/:roomId/participants'), (msg) => {
      const data = safeJSON(msg.body, 'participants');
      if (!data) return;
      log('👥 participants event:', data);
      savedHandlers.current?.onParticipantEvent?.(data);
    });

    subscribe(makeTopic(roomId, 'room/:roomId/roster'), (msg) => {
      const data = safeJSON(msg.body, 'roster');
      if (!data) return;
      log('🧾 roster:', data);
      savedHandlers.current?.onRosterChange?.(data);
    });

    subscribe(makeTopic(roomId, 'room/:roomId/ready'), (msg) => {
      const data = safeJSON(msg.body, 'ready');
      if (!data) return;
      log('🟡 ready:', data);
      savedHandlers.current?.onReadyStatus?.(data);
    });

    subscribe(makeTopic(roomId, 'room/:roomId/can-start'), (msg) => {
      const data = safeJSON(msg.body, 'can-start');
      if (!data) return;
      log('✅ can-start:', data);
      savedHandlers.current?.onCanStart?.(data);
    });

    // ✅ 채팅 관련
    subscribe(makeTopic(roomId, 'room/:roomId/chat'), (msg) => {
      const data = safeJSON(msg.body, 'chat');
      if (!data) return;
      log('💬 chat:', data);
      savedHandlers.current?.onChatMessage?.(data);
    });

    // ✅ 게임 진행 관련 (핵심)
    subscribe(makeTopic(roomId, 'room/:roomId'), (msg) => {
      const data = safeJSON(msg.body, 'room-event');
      if (!data || !data.type) return;

      switch (data.type) {
        case 'ROUND_INTRO':
          log('🎮 game/round-intro:', data);
          savedHandlers.current?.onRoundIntro?.(data);
          break;
        case 'ROUND_ENDED':
          log('🏁 game/round-end:', data);
          savedHandlers.current?.onRoundEnd?.(data);
          break;
        default:
          // JOINED, LEFT 등 다른 이벤트는 이미 participants 채널에서 처리되므로 무시
          break;
      }
    });

    // ✅ 게임 점수 관련
    subscribe(makeTopic(roomId, 'room/:roomId/score'), (msg) => {
      const data = safeJSON(msg.body, 'game/score');
      if (!data) return;
      log('📈 game/score:', data);
      savedHandlers.current?.onGameScore?.(data);
    });

    // 클린업
    return () => {
      unsubscribeAll('effect-cleanup');
      log(`📴 구독 종료 (roomId=${roomId})`);
    };
  }, [client, isConnected, roomId, subscribe, unsubscribeAll]); // ⬅️ Remove 'config' from dependency array to prevent WebSocket tear downs on every render

  // 퍼블리시 공통 유틸(로깅 + 가드)
  const publish = useCallback((destination: string, body: any) => {
    if (!client) { warn('PUB 실패: client 없음', destination); return; }
    if (!client.connected) { warn('PUB 실패: STOMP 미연결', destination); return; }
    log('📤 PUB', destination, body);
    try {
      client.publish({ destination, body: JSON.stringify(body) });
    } catch (e) {
      err('PUB 예외:', destination, e);
    }
  }, [client]);

  // 구체적인 전송 메서드들
  const sendMessage = useCallback((content: string) => {
    if (!roomId) return;
    publish(makeTopic(roomId, 'room/:roomId/chat'), { content });
  }, [roomId, publish]);

  return {
    sendMessage,
  };
};
