import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ParticipantTile } from "@/widgets/ParticipantTile";

interface Participant {
  identity: string;
  isConnected: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
}

interface ParticipantGridProps {
  participants: Participant[];
  isLiveKitConnected: boolean;
  participantScrollIndex: number;
  maxVisibleParticipants: number;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export function ParticipantGrid({
  participants,
  isLiveKitConnected,
  participantScrollIndex,
  maxVisibleParticipants,
  onScrollLeft,
  onScrollRight,
}: ParticipantGridProps) {
  const visibleParticipants = participants.slice(
    participantScrollIndex,
    participantScrollIndex + maxVisibleParticipants
  );

  return (
    <div className="bg-white/50 backdrop-blur-sm border-b border-[#6dc4e8]/20 p-2 sm:p-3 lg:p-4">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-base sm:text-lg lg:text-xl text-slate-700 tracking-wider">
          참가자들 ({participants.length + 1}명)
        </h3>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isLiveKitConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
          }`} />
          <span className="text-xs sm:text-sm text-slate-600">
            {isLiveKitConnected ? '실시간 연결' : '연결 중...'}
          </span>
        </div>
      </div>

      <div className="relative">
        {/* 왼쪽 스크롤 버튼 */}
        {participants.length > 0 && participantScrollIndex > 0 && (
          <motion.button
            onClick={onScrollLeft}
            className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-[#6dc4e8]/80 text-white hover:bg-[#6dc4e8] shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
        )}

        {/* 참가자 영상들 */}
        <div className="flex gap-3 sm:gap-4 lg:gap-6 mx-4 sm:mx-6 lg:mx-8 overflow-hidden justify-center">
          {participants.length > 0 ? (
            visibleParticipants.map((participant, index) => (
              <motion.div
                key={participant.identity || index}
                className="relative w-36 h-28 sm:w-44 sm:h-32 lg:w-52 lg:h-40 xl:w-56 xl:h-44 bg-white/80 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-[#6dc4e8]/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <ParticipantTile participant={participant} />
                
                {/* 참가자 이름 오버레이 */}
                <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
                  <div className="bg-[#6dc4e8]/90 backdrop-blur-sm rounded px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1">
                    <span className="text-white text-xs sm:text-sm lg:text-sm font-['BM_HANNA_TTF:Regular',_sans-serif] truncate block text-center">
                      {participant.identity}
                    </span>
                  </div>
                </div>

                {/* 연결 상태 표시 */}
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-white sm:border-2 shadow-sm" />
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="w-full h-28 sm:h-32 lg:h-40 xl:h-44 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* 참가자가 없을 때 */}
            </motion.div>
          )}
        </div>

        {/* 오른쪽 스크롤 버튼 */}
        {participants.length > 0 && participantScrollIndex + maxVisibleParticipants < participants.length && (
          <motion.button
            onClick={onScrollRight}
            className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-[#6dc4e8]/80 text-white hover:bg-[#6dc4e8] shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
