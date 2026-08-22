import { motion } from "framer-motion";
import type { GameData } from "@/shared/types/game";

interface GameCompleteScreenProps {
  gameData: GameData;
}

export function GameCompleteScreen({ gameData }: GameCompleteScreenProps) {
  
  return (
    <motion.div
      className="h-screen flex flex-col bg-[#F0F8FF] font-sans items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6dc4e8]/10 via-white/50 to-[#6dc4e8]/10 -z-10" />
      
      {/* 라운드 완료 결과 */}
      <motion.div 
        className="text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-3xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-[#6dc4e8] tracking-wider mb-4">
          라운드 {gameData.currentRound} 완료!
        </h1>
        <h2 className="text-2xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-black tracking-wider mb-2">
          {/* {currentGameConfig.title} */}
        </h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 border-2 border-[#6dc4e8]/30 shadow-lg max-w-md">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">🎉</span>
            <span className="text-xl font-bold text-green-600">게임 완료!</span>
          </div>
          <p className="text-slate-600 mb-4">AI 분석 결과를 확인해주세요</p>
          <div className="text-sm text-slate-500">
            결과 화면으로 이동 중...
          </div>
        </div>
      </motion.div>

      {/* 로딩 애니메이션 */}
      <motion.div 
        className="flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-8 h-8 border-4 border-[#6dc4e8] border-t-transparent rounded-full"></div>
      </motion.div>
    </motion.div>
  );
}
