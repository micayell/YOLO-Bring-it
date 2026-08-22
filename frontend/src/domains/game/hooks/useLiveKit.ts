import { useEffect, useCallback, useRef } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Participant,
  Track,
  TrackPublication,
} from 'livekit-client';
import { useLiveKitStore } from '@/domains/game/stores/livekitStore';
import { livekitService } from '@/domains/game/services/livekitService';

export const useLiveKit = (roomId: string) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  const {
    room,
    participants,
    livekitUrl,
    isConnecting,
    isConnected,
    error,
    setRoom,
    setParticipants,
    addParticipant,
    removeParticipant,
    updateParticipant, // 스토어에서 가져오기
    setConnecting,
    setConnected,
    setError,
    setToken,
    reset,
  } = useLiveKitStore();

  // 방에 연결
  const connectToRoom = useCallback(async () => {
    if (!roomId || roomId === '' || roomId === 'disabled_room') {
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      
      // 1. 백엔드에서 토큰 가져오기
      const newToken = await livekitService.getLiveKitToken(roomId);
      setToken(newToken);

      // 2. Room 객체 생성 및 이벤트 리스너 설정
      const newRoom = new Room({
        // 성능 최적화 옵션
        adaptiveStream: true,
        dynacast: true,
        // E2EE 암호화 옵션
        // e2ee: {
        //   keyProvider: new Cryptor(),
        //   worker: new Worker(new URL('livekit-client/e2ee-worker', import.meta.url)),
        // },
      });

      // 3. 이벤트 핸들러
      const onParticipantConnected = (participant: RemoteParticipant) => {
        addParticipant(participant);
      };
      const onParticipantDisconnected = (participant: RemoteParticipant) => {
        removeParticipant(participant);
      };
      const onDisconnected = (_reason: any) => {
        reset();
      };
      const onTrackSubscribed = (
        _track: Track,
        publication: TrackPublication,
        participant: RemoteParticipant
      ) => {
        updateParticipant(participant, publication);
      };
      const onTrackUnsubscribed = (
        _track: Track,
        publication: TrackPublication,
        participant: RemoteParticipant
      ) => {
        updateParticipant(participant, publication);
      };
      const onLocalTrackPublished = (publication: TrackPublication, _participant: Participant) => {
        if (publication.kind === 'video' && localVideoRef.current) {
          const videoTrack = publication.track;
          if (videoTrack) {
            videoTrack.attach(localVideoRef.current);
          }
        }
      };
      
      newRoom
        .on(RoomEvent.ParticipantConnected, onParticipantConnected)
        .on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected)
        .on(RoomEvent.Disconnected, onDisconnected)
        .on(RoomEvent.TrackSubscribed, onTrackSubscribed)
        .on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
        .on(RoomEvent.LocalTrackPublished, onLocalTrackPublished);
        
      // 4. 서버에 연결
      await newRoom.connect(livekitUrl, newToken);
      
      // 5. 상태 업데이트
      setRoom(newRoom);
      setConnected(true);
      const remoteParticipants = Array.from(newRoom.remoteParticipants.values());
      setParticipants(remoteParticipants);
      
      
      // 6. 로컬 카메라와 마이크 활성화 및 발행
      try {
        await newRoom.localParticipant.setCameraEnabled(true);
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        
      } catch (mediaError) {
        console.warn('⚠️ 로컬 미디어 활성화 실패 (권한 문제일 수 있음):', mediaError);
      }

    } catch (err: unknown) {
      console.error('❌ LiveKit 방 연결 실패:', err);
      setError((err as Error).message || '방에 연결하지 못했습니다.');
      reset();
    } finally {
      setConnecting(false);
    }
  }, [roomId, livekitUrl, setToken, addParticipant, removeParticipant, updateParticipant, setRoom, setConnected, setError, setParticipants, reset]);

  // 방 나가기
  const leaveRoom = useCallback(async () => {
    if (room) {
      await room.disconnect();
      reset();
    }
  }, [room, reset]);
  
  // 로컬 비디오 활성화/비활성화
  const toggleVideo = useCallback(async () => {
    if (room?.localParticipant) {
      const enabled = room.localParticipant.isCameraEnabled;
      await room.localParticipant.setCameraEnabled(!enabled);
    }
  }, [room]);

  // 로컬 오디오 활성화/비활성화
  const toggleAudio = useCallback(async () => {
    if (room?.localParticipant) {
      const enabled = room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(!enabled);
    }
  }, [room]);

  // 컴포넌트 언마운트 시 자동으로 방 나가기
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  return {
    // 상태
    room,
    participants: Array.from(participants.values()),
    isConnecting,
    isConnected,
    error,
    localParticipant: room?.localParticipant,
    localVideoRef,
    
    // 로컬 참가자 상태
    isVideoEnabled: room?.localParticipant?.isCameraEnabled ?? false,
    isAudioEnabled: room?.localParticipant?.isMicrophoneEnabled ?? false,
    remoteParticipants: Array.from(participants.values()), // Map을 배열로 변환하여 반환

    // 액션
    connectToRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
  };
};
