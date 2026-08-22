import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import type { GameData, GameType } from "@/shared/types/game";
import { GAME_DETAILED_CONFIG } from "@/shared/types/game";
import {
  BringIt,
  ShowMeTheArt,
} from "./games";

interface GameHeaderProps {
  gameData: GameData;
  remainingTime: number;
  isTimeRunningOut: boolean;
  onGameEnd: () => void;
  gamePhase: "countdown" | "playing" | "complete";
}

export function GameHeader({ 
  gameData, 
  remainingTime, 
  isTimeRunningOut, 
  onGameEnd,
  gamePhase
}: GameHeaderProps) {
  const currentGameConfig = GAME_DETAILED_CONFIG[gameData.gameType as GameType];

  const formatGameTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 게임별 특별한 UI 요소 렌더링
  const renderGameSpecificUI = () => {
    // 게임 타입에 따른 컴포넌트 매핑
    const gameComponentMap: Record<string, React.ReactNode> = {
      'bring_object': (
        <BringIt 
          targetObject="핸드폰"
          timeLeft={remainingTime}
          videoRef={undefined}
          isGameActive={gamePhase === 'playing'}
          onGameComplete={(success) => {
            if (success) onGameEnd();
          }}
        />
      ),
      'drawing': (
        <ShowMeTheArt 
          videoRef={useRef<HTMLVideoElement>(null)}
          isGameActive={gamePhase === 'playing'}
          onGameComplete={(success) => {
            if (success) onGameEnd();
          }}
        />
      ),
    };

    return gameComponentMap[gameData.gameType] || null;
  };

  // 게임 규칙 표시 컴포넌트
  const GameRules = () => (
    <motion.div 
      className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border-2 border-[#6dc4e8]/30 max-w-xs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">📋</span>
        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-base">게임 규칙</span>
      </div>
      <ul className="space-y-1 text-xs text-gray-700">
        <li>• {currentGameConfig.rules[0]}</li>
        <li>• {currentGameConfig.rules[1]}</li>
        <li>• {currentGameConfig.rules[2]}</li>
      </ul>
    </motion.div>
  );

  return (
    <header className="flex flex-col bg-white/50 backdrop-blur-sm border-b border-[#6dc4e8]/20">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between p-4">
        <motion.button 
          onClick={onGameEnd}
          className="p-2 rounded-lg bg-[#6dc4e8]/20 hover:bg-[#6dc4e8]/30 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-6 h-6 text-[#6dc4e8]" />
        </motion.button>
        
        <div className="text-center">
          <h1 className="text-xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-black tracking-wider">
            {currentGameConfig.title}
          </h1>
        </div>
      
        <div className="flex items-center gap-2 text-slate-700">
          <Clock className="w-5 h-5 text-[#6dc4e8]" />
          <motion.span 
            className={`font-mono font-bold ${isTimeRunningOut ? 'text-red-500' : 'text-slate-700'}`}
            animate={isTimeRunningOut ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isTimeRunningOut ? Infinity : 0 }}
          >
            {formatGameTime(remainingTime)}
          </motion.span>
        </div>
      </div>

      {/* 게임 설명 및 특별 UI 영역 */}
      {gamePhase === "playing" && (
        <div className="px-4 pb-4">
          <div className="flex items-start justify-between gap-4">
            {/* 게임 설명 */}
            <motion.div 
              className="flex-1 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border-2 border-[#6dc4e8]/30"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg">{currentGameConfig.icon}</span>
                <h3 className="text-base font-['BM_HANNA_TTF:Regular',_sans-serif] text-gray-800">
                  {currentGameConfig.instruction}
                </h3>
              </div>
              <p className="text-xs text-gray-600 text-center">{currentGameConfig.description}</p>
            </motion.div>

            {/* 게임별 특별한 UI 요소들 */}
            {renderGameSpecificUI()}

            {/* 게임 규칙 */}
            <GameRules />
          </div>
        </div>
      )}
    </header>
  );
}
