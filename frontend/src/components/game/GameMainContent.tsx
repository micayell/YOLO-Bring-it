import { motion, AnimatePresence } from "framer-motion";
import { X, PanelRightOpen } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";

import { GameTimer } from "./GameTimer";
import { ChatSidePanel } from "@/widgets/ChatComponents";

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: string;
}

interface GameMainContentProps {
  // 비디오 관련
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isConnecting: boolean;
  localWebRTCError: string | null;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  
  // 게임 관련
  gameData: any;
  needsCapture: boolean;
  captureStatus: string;
  remainingTime: number;
  timeLimit: number;
  
  // AI 훅 결과들
  objectDetection?: any;
  emotionRecognition?: any;
  colorAnalysis?: any;
  eyeBlinkDetection?: any;
  clipSimilarity?: any;
  aiGameStarted: boolean;
  
  // 채팅 관련
  isPortrait: boolean;
  isChatVisible: boolean;
  isChatOpen: boolean;
  messages: ChatMessage[];
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: () => void;
  onToggleChat: () => void;
  onCloseChat: () => void;
}

export function GameMainContent({
  videoRef,
  isVideoEnabled,
  isAudioEnabled,
  isConnecting,
  localWebRTCError,
  onToggleVideo,
  onToggleAudio,
  remainingTime,
  timeLimit,
  // emotionRecognition,
  // colorAnalysis,
  // eyeBlinkDetection,
  // clipSimilarity,
  // aiGameStarted,
  isPortrait,
  isChatVisible,
  // isChatOpen,
  messages,
  message,
  setMessage,
  onSendMessage,
  onKeyPress,
  onToggleChat,
  onCloseChat,
}: GameMainContentProps) {
  return (
    <div className="flex-1 flex overflow-hidden relative">

      
      {/* 중앙 - 내 화면 영역 */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        !isPortrait && isChatVisible ? 'mr-0' : 'mr-0'
      }`}>
        {/* 비디오 플레이어 */}
        <VideoPlayer
          videoRef={videoRef}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          isConnecting={isConnecting}
          localWebRTCError={localWebRTCError}
          onToggleVideo={onToggleVideo}
          onToggleAudio={onToggleAudio}
        />

        {/* 게임 타이머 */}
        <GameTimer
          remainingTime={remainingTime}
          timeLimit={timeLimit}
        />
      </div>

      {/* 오른쪽 채팅 패널 (데스크톱) */}
      <AnimatePresence>
        {!isPortrait && isChatVisible && (
          <motion.div 
            className="w-80 bg-white/50 backdrop-blur-sm border-l border-[#6dc4e8]/20 relative"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 채팅 닫기 버튼 */}
            <motion.button
              onClick={onCloseChat}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[#6dc4e8]/20 hover:bg-[#6dc4e8]/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-slate-600" />
            </motion.button>
            
            <ChatSidePanel
              messages={messages}
              message={message}
              setMessage={setMessage}
              onSendMessage={onSendMessage}
              onKeyPress={onKeyPress}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 채팅 열기 버튼 (채팅이 숨겨졌을 때) */}
      {!isPortrait && !isChatVisible && (
        <motion.button
          onClick={onToggleChat}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-[#6dc4e8]/90 text-white shadow-lg hover:bg-[#6dc4e8] z-20"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <PanelRightOpen className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}
