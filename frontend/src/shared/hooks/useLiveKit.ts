import { useEffect, useCallback, useRef } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Participant,
  Track,
  TrackPublication,
} from 'livekit-client';
import { useLiveKitStore } from '@/app/stores/livekitStore';
import { livekitService } from '@/shared/services/livekitService';

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
    if (!roomId || roomId === '' || roomId === 'disabled_room' || roomId === null) {
      console.log('⏭️ LiveKit 연결 스킵 (유효하지 않은 roomId):', roomId);
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      console.log('🔄 LiveKit 연결 시작. Room ID:', roomId);
      console.log('🌐 LiveKit 서버 URL:', livekitUrl);
      
      // 1. 백엔드에서 토큰 가져오기
      console.log('📡 백엔드에서 토큰 요청 중...');
      const newToken = await livekitService.getLiveKitToken(roomId);
      console.log('✅ 토큰 수신 완료:', newToken.substring(0, 20) + '...');
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
        console.log('🎉 새로운 참가자 입장:', participant.identity);
        addParticipant(participant);
      };
      const onParticipantDisconnected = (participant: RemoteParticipant) => {
        console.log('👋 참가자 퇴장:', participant.identity);
        removeParticipant(participant);
      };
      const onDisconnected = (reason: any) => {
        console.log('🚪 방에서 연결 끊김:', reason);
        reset();
      };
      const onTrackSubscribed = (
        track: Track,
        publication: TrackPublication,
        participant: RemoteParticipant
      ) => {
        console.log('🎧 트랙 구독:', track.sid, '참가자:', participant.identity);
        updateParticipant(participant, publication);
      };
      const onTrackUnsubscribed = (
        track: Track,
        publication: TrackPublication,
        participant: RemoteParticipant
      ) => {
        console.log('🔇 트랙 구독 해제:', track.sid, '참가자:', participant.identity);
        updateParticipant(participant, publication);
      };
      const onLocalTrackPublished = (publication: TrackPublication, participant: Participant) => {
        console.log('📢 로컬 트랙 발행:', publication.trackSid, '종류:', publication.kind);
        if (publication.kind === 'video' && localVideoRef.current) {
          const videoTrack = publication.track;
          if (videoTrack) {
            videoTrack.attach(localVideoRef.current);
            console.log('📺 로컬 비디오 요소에 연결 완료');
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
      console.log('🔗 LiveKit 서버에 연결 시도 중...');
      await newRoom.connect(livekitUrl, newToken);
      console.log('✅ LiveKit 서버 연결 성공!');
      
      // 5. 상태 업데이트
      setRoom(newRoom);
      setConnected(true);
      const remoteParticipants = Array.from(newRoom.remoteParticipants.values());
      setParticipants(remoteParticipants);
      
      console.log('👥 연결된 참가자 수:', newRoom.remoteParticipants.size + 1); // +1은 로컬 참가자
      console.log('🎥 로컬 참가자 카메라 상태:', newRoom.localParticipant.isCameraEnabled);
      console.log('🎤 로컬 참가자 마이크 상태:', newRoom.localParticipant.isMicrophoneEnabled);
      
      // 6. 로컬 카메라와 마이크 활성화 및 발행
      try {
        console.log('📹 로컬 카메라 활성화 및 발행 시도...');
        await newRoom.localParticipant.setCameraEnabled(true);
        console.log('🎤 로컬 마이크 활성화 및 발행 시도...');
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        console.log('✅ 로컬 미디어 활성화 및 발행 완료!');
        
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
    participants,
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
