import { motion } from "framer-motion";

interface TimeSniperProps {
  targetTime: number;
  currentTime: number;
  timeLeft: number;
  onTimeClick: () => void;
}

export function TimeSniper({ 
  targetTime, 
  currentTime, 
  // timeLeft, 
  onTimeClick 
}: TimeSniperProps) {
  const timeDifference = Math.abs(currentTime - targetTime);
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border-2 border-[#8b5cf6]/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🎯</span>
        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-base">시간 맞추기</span>
      </div>
      <div className="text-center">
        <div className="bg-purple-100 rounded-lg p-2 mb-1">
          <p className="font-bold text-purple-600 text-base">{targetTime}초</p>
        </div>
        <p className="text-xs text-gray-600">정확한 시간에 클릭하세요!</p>
        <div className="mt-1 text-xs text-purple-500 font-bold">
          차이: {timeDifference.toFixed(1)}초
        </div>
        <motion.button
          onClick={onTimeClick}
          className="mt-2 bg-purple-500 text-white px-3 py-1 rounded text-xs"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          클릭!
        </motion.button>
      </div>
    </div>
  );
}
