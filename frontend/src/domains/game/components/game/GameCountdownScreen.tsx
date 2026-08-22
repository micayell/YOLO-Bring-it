import { motion } from "framer-motion";
import type { GameData } from "@/shared/types/game";

interface GameCountdownScreenProps {
  gameData: GameData;
  countdown: number;
}

export function GameCountdownScreen({ gameData, countdown }: GameCountdownScreenProps) {
  return (
    <motion.div
      className="h-screen flex flex-col bg-[#F0F8FF] font-sans items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6dc4e8]/10 via-white/50 to-[#6dc4e8]/10 -z-10" />
      
      {/* 라운드 정보 */}
      <motion.div 
        className="text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-[#6dc4e8] tracking-wider mb-2">
          라운드 {gameData.currentRound}
        </h1>
        <h2 className="text-3xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-black tracking-wider mb-2">
          {gameData.gameName}
        </h2>
        <p className="text-lg text-slate-600">{gameData.gameDescription}</p>
      </motion.div>

      {/* 카운트다운 숫자 (3, 2, 1만) */}
      <motion.div
        key={`countdown-${countdown}`}
        initial={{ scale: 1.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: -50 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-9xl md:text-[12rem] font-bold text-[#6dc4e8] drop-shadow-2xl"
        style={{ fontFamily: "'Bangers', cursive" }}
      >
        {countdown}
      </motion.div>

      {/* 게임 설명 */}
      <motion.div 
        className="text-center mt-8 max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-slate-600">{gameData.gameDescription}</p>
      </motion.div>
    </motion.div>
  );
}
