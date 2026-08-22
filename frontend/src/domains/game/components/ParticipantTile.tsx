import React, { useEffect, useRef, useState } from 'react';
import { Participant, Track, ParticipantEvent, TrackPublication } from 'livekit-client';
import { VideoOff, MicOff, User } from 'lucide-react';

// 가짜 참가자 데이터 타입
interface MockParticipant {
  identity: string;
  isConnected: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
}

interface ParticipantTileProps {
  participant: Participant | MockParticipant;
  livekitParticipant?: Participant;
  isLocal?: boolean;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({ participant, livekitParticipant, isLocal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // 실제 LiveKit 참가자가 있는지 확인 (props로 전달받은 경우 우선 사용)
  const actualParticipant = livekitParticipant || participant;
  const isMockParticipant = !livekitParticipant && !('tracks' in participant);

  useEffect(() => {
    if (isMockParticipant) return;

    const p = actualParticipant as Participant;
    
    const handlePublications = (publications: TrackPublication[]) => {
      publications.forEach(pub => {
        if (pub.track) {
          if (pub.kind === Track.Kind.Video) {
            pub.track.attach(videoRef.current!);
          }
          if (pub.kind === Track.Kind.Audio) {
            pub.track.attach(audioRef.current!);
          }
        }
      });
    };
    
    const handleTrackMuted = (pub: TrackPublication) => {
      if (pub.kind === Track.Kind.Video) setIsVideoMuted(true);
      if (pub.kind === Track.Kind.Audio) setIsAudioMuted(true);
    };

    const handleTrackUnmuted = (pub: TrackPublication) => {
      if (pub.kind === Track.Kind.Video) setIsVideoMuted(false);
      if (pub.kind === Track.Kind.Audio) setIsAudioMuted(false);
    };

    // 초기 상태 설정
    const videoPub = p.getTrackPublication(Track.Source.Camera);
    const audioPub = p.getTrackPublication(Track.Source.Microphone);
    
    setIsVideoMuted(videoPub ? videoPub.isMuted : !p.isCameraEnabled);
    setIsAudioMuted(audioPub ? audioPub.isMuted : !p.isMicrophoneEnabled);

    // 기존 트랙들 붙이기
    handlePublications(Array.from(p.trackPublications.values()));

    p.on(ParticipantEvent.TrackPublished, (pub) => {
      if (pub.track) {
        if (pub.kind === Track.Kind.Video) pub.track.attach(videoRef.current!);
        if (pub.kind === Track.Kind.Audio) pub.track.attach(audioRef.current!);
      }
    });
    p.on(ParticipantEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video) track.attach(videoRef.current!);
        if (track.kind === Track.Kind.Audio) track.attach(audioRef.current!);
    });
    
    p.on(ParticipantEvent.TrackMuted, handleTrackMuted);
    p.on(ParticipantEvent.TrackUnmuted, handleTrackUnmuted);

    return () => {
      p.off(ParticipantEvent.TrackPublished, () => {});
      p.off(ParticipantEvent.TrackSubscribed, () => {});
      p.off(ParticipantEvent.TrackMuted, handleTrackMuted);
      p.off(ParticipantEvent.TrackUnmuted, handleTrackUnmuted);

      p.trackPublications.forEach(pub => {
        pub.track?.detach();
      });
    };
  }, [actualParticipant, isMockParticipant]);
  
  // 가짜 참가자의 경우 시뮬레이션된 아바타 색상들
  const avatarColors = [
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-green-400 to-green-600', 
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-pink-400 to-pink-600',
    'bg-gradient-to-br from-yellow-400 to-yellow-600',
  ];
  
  const getAvatarColor = (name: string) => {
    const index = name.length % avatarColors.length;
    return avatarColors[index];
  };

  if (isMockParticipant) {
    const mockParticipant = participant as MockParticipant;
    
    return (
      <div className="relative bg-slate-800 rounded-lg overflow-hidden w-full h-full">
        {mockParticipant.hasVideo ? (
          // 가짜 비디오: 이름 첫 글자가 있는 컬러풀한 아바타
          <div className={`w-full h-full flex items-center justify-center ${getAvatarColor(mockParticipant.identity)}`}>
            <span className="text-white text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">
              {mockParticipant.identity.charAt(0)}
            </span>
          </div>
        ) : (
          // 비디오 꺼짐 상태
          <div className="w-full h-full flex items-center justify-center bg-slate-700">
            <VideoOff className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-slate-400" />
          </div>
        )}

        {/* 연결 상태 표시 */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <div className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-full ${
            mockParticipant.isConnected ? 'bg-green-500' : 'bg-red-500'
          } border-2 border-white shadow-sm`} />
        </div>

        {/* 오디오 상태 표시 */}
        {!mockParticipant.hasAudio && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <div className="p-1 sm:p-1.5 lg:p-2 rounded-full bg-red-500/80">
              <MicOff className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            </div>
          </div>
        )}

        {/* 참가자 이름 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3">
          <span className="text-white text-sm sm:text-base lg:text-lg font-medium">
            {mockParticipant.identity}
          </span>
        </div>
      </div>
    );
  }

  // 실제 LiveKit 참가자의 경우
  const realParticipant = (actualParticipant as Participant);
  
  return (
    <div className={`relative rounded-lg overflow-hidden w-full h-full ${isVideoMuted ? 'bg-slate-700' : 'bg-black'}`}>
      <video ref={videoRef} className={`w-full h-full object-cover ${isVideoMuted ? 'hidden' : 'block'}`} autoPlay playsInline muted={isLocal} />
      <audio ref={audioRef} autoPlay muted={isLocal} />

      {isVideoMuted && (
        <div className="w-full h-full flex items-center justify-center">
           <User className="w-16 h-16 text-slate-400" />
        </div>
      )}
      
      {/* 오디오 음소거 상태 표시 */}
      {isAudioMuted && (
        <div className="absolute top-2 left-2 p-1.5 rounded-full bg-red-500/80">
          <MicOff className="w-4 h-4 text-white" />
        </div>
      )}

      {/* 연결 상태 표시 */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
        <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-full bg-green-500 border-2 border-white shadow-sm" />
      </div>

      {/* 참가자 이름 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3">
        <span className="text-white text-sm sm:text-base lg:text-lg font-medium">
          {realParticipant.identity}
          {realParticipant.isLocal && ' (나)'}
        </span>
      </div>
    </div>
  );
};
