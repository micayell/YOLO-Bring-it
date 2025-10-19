import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";


interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isConnecting: boolean;
  localWebRTCError: string | null;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
}

export function VideoPlayer({
  videoRef,
  isVideoEnabled,
  isAudioEnabled,
  isConnecting,
  localWebRTCError,
  onToggleVideo,
  onToggleAudio,
}: VideoPlayerProps) {
  return (
    <motion.div 
      className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl border-4 border-[#6dc4e8]/30"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        style={{ 
          backgroundColor: 'black',
          minHeight: '200px' // 최소 높이 설정
        }}
      />

      {/* 내 화면 컨트롤 오버레이 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
        <motion.button
          onClick={onToggleVideo}
          className="p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg bg-[#6dc4e8]/80 text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </motion.button>
        
        <motion.button
          onClick={onToggleAudio}
          className="p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg bg-[#6dc4e8]/80 text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* 내 화면 라벨 */}
      <div className="absolute top-4 left-4">
        <div className="bg-[#6dc4e8]/90 backdrop-blur-sm rounded-lg px-3 py-1">
          <span className="text-white text-sm font-['BM_HANNA_TTF:Regular',_sans-serif]">
            내 화면
          </span>
        </div>
      </div>

      {/* 연결 상태 표시 */}
      <div className="absolute top-4 right-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg backdrop-blur-sm text-xs font-medium ${
          isVideoEnabled ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isVideoEnabled ? 'bg-green-300' : 'bg-red-300'
          }`} />
          {isVideoEnabled ? '카메라 ON' : '카메라 OFF'}
        </div>
      </div>

      {/* 카메라 연결 상태 표시 */}
      {isConnecting && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg backdrop-blur-sm text-xs font-medium bg-yellow-500/90 text-white">
            <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
            카메라 연결 중...
          </div>
        </div>
      )}

      {/* 카메라 오류 표시 */}
      {localWebRTCError && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg backdrop-blur-sm text-xs font-medium bg-red-500/90 text-white">
            <div className="w-2 h-2 rounded-full bg-red-300" />
            카메라 오류: {localWebRTCError}
          </div>
        </div>
      )}
    </motion.div>
  );
}
