import { motion } from "framer-motion";

interface HeadBangingProps {
  score: number;
  timeLeft: number;
  isGameActive: boolean;
  onHeadMove: () => void;
}

export function HeadBanging({ 
  score, 
  // timeLeft, 
  isGameActive, 
  onHeadMove 
}: HeadBangingProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border-2 border-[#f59e0b]/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🦅</span>
        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-base">플래피 버드</span>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-1">🦅</div>
        <p className="text-xs text-gray-600">머리를 움직여 장애물을 피하세요!</p>
        <div className="mt-1 text-xs text-orange-500 font-bold">
          점수: {score}점
        </div>
        {isGameActive && (
          <motion.button
            onClick={onHeadMove}
            className="mt-2 bg-orange-500 text-white px-3 py-1 rounded text-xs"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            점프!
          </motion.button>
        )}
      </div>
    </div>
  );
}
