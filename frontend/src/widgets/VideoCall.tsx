import React, { useEffect } from 'react';
import { useLiveKit } from '@/shared/hooks/useLiveKit';
import { Button } from '@/shared/ui/button';

import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { ParticipantTile } from './ParticipantTile';

interface VideoCallProps {
  roomId: string;
  onLeave?: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({ roomId, onLeave }) => {
  const {
    room,
    participants,
    isConnecting,
    isConnected,
    error,
    localParticipant,
    connectToRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
  } = useLiveKit(roomId);

  useEffect(() => {
    connectToRoom();

    return () => {
      leaveRoom();
    };
  }, [connectToRoom, leaveRoom]);

  const handleLeaveSession = async () => {
    await leaveRoom();
    onLeave?.();
  };
  
  // 로컬 참가자도 참가자 목록에 포함하여 렌더링
  const allParticipants = localParticipant ? [localParticipant, ...participants] : participants;

  if (isConnecting) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">연결 중...</div>;
  }
  
  if (error) {
     return <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">오류: {error}</div>;
  }

  if (!isConnected || !room) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">방에 연결되지 않았습니다.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="flex-1 p-4">
        <div className={`grid gap-4 h-full ${
          allParticipants.length <= 2 ? 'grid-cols-1' :
          allParticipants.length <= 4 ? 'grid-cols-2' :
          allParticipants.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'
        }`}>
          {allParticipants.map((participant) => (
            <ParticipantTile key={participant.sid} participant={participant} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4 p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <Button onClick={toggleAudio} variant="ghost" size="lg" className="rounded-full p-3">
          {localParticipant?.isMicrophoneEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </Button>
        <Button onClick={toggleVideo} variant="ghost" size="lg" className="rounded-full p-3">
          {localParticipant?.isCameraEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </Button>
        <Button onClick={handleLeaveSession} variant="ghost" size="lg" className="rounded-full p-3 text-red-400 hover:bg-red-500/20">
          <PhoneOff size={24} />
        </Button>
      </div>
    </div>
  );
};
