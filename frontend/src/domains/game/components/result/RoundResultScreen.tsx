import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, Medal, Award, Clock, Target } from "lucide-react";
import { GameData, Player } from "@/shared/types/game";

interface PlayerResult {
  id: number;
  name: string;
  reactionTime: number | null;
  status: 'waiting' | 'ready' | 'false-start' | 'completed';
}

interface RoundResultScreenProps {
  gameData?: GameData;
  playerResults?: PlayerResult[];
  onNextRound: () => void;
  onGameEnd: () => void;
}

export function RoundResultScreen({
  gameData,
  playerResults,
  onNextRound,
  onGameEnd,
}: RoundResultScreenProps) {
  const [timeLeft, setTimeLeft] = useState(5);
  const isLastRoundGlobal = gameData ? gameData.currentRound >= gameData.totalRounds : false;

  useEffect(() => {
    if (timeLeft <= 0) {
      if (isLastRoundGlobal) {
        onGameEnd();
      } else {
        onNextRound();
      }
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isLastRoundGlobal, onGameEnd, onNextRound]);

  // PlayerResult[] 형식인 경우 처리 (FingerIt에서 전달)
  if (playerResults && Array.isArray(playerResults)) {
    console.log('📊 RoundResultScreen - playerResults 받음:', playerResults);
    const sortedResults = playerResults
      .filter(r => r.status === 'completed' && r.reactionTime !== null)
      .sort((a, b) => (a.reactionTime || Infinity) - (b.reactionTime || Infinity))
      .map((r, index) => ({
        playerId: r.id,
        rank: index + 1,
        score: r.reactionTime || 0,
        name: r.name
      }));

    return (
      <div className="bg-background text-foreground h-screen w-full relative overflow-hidden flex flex-col transition-colors duration-300">
        {/* 상단 헤더 */}
        <div className="flex-shrink-0 text-center py-6 relative z-20">
          <div className="bg-card/80 backdrop-blur-sm inline-block px-8 py-4 rounded-[25px] shadow-lg border-2 border-[#6dc4e8]/30">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">⚡</span>
              <h1 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl lg:text-3xl text-[#6dc4e8] tracking-wider">
                라운드 결과
              </h1>
            </div>
            <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-base lg:text-lg text-muted-foreground tracking-wider">
              FingerIt
            </p>
          </div>
        </div>

        {/* 메인 순위 결과 */}
        <div className="flex-1 px-4 lg:px-8 pb-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* 1등 카드 */}
            {sortedResults.length > 0 && (
              <div className="mb-6">
                <div className="relative bg-gradient-to-br from-[#ffd700] to-[#ffed4e] rounded-[25px] p-6 lg:p-8 shadow-2xl border-4 border-[#ffd700] overflow-hidden">
                  <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="text-3xl">👑</span>
                      <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-3xl lg:text-4xl text-white tracking-wider">
                        1등
                      </span>
                      <span className="text-3xl">👑</span>
                    </div>
                    <h2 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl lg:text-3xl text-white tracking-wider mb-4">
                      {sortedResults[0].name}
                    </h2>
                    <div className="bg-white/20 backdrop-blur-sm rounded-[20px] px-6 py-4 inline-block mb-4">
                      <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-4xl lg:text-5xl text-white tracking-wider leading-none">
                        {sortedResults[0].score}ms
                      </div>
                      <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-sm lg:text-base text-white opacity-80 mt-1">
                        반응 속도
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2-6등 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {sortedResults.slice(1).map((result) => (
                <div key={result.playerId} className="relative bg-gradient-to-br from-[#c0c0c0] to-[#e8e8e8] rounded-[20px] p-4 lg:p-6 shadow-xl border-3 border-[#c0c0c0] overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏆</span>
                      <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl lg:text-2xl text-gray-800 tracking-wider">
                        {result.rank}등
                      </span>
                    </div>
                  </div>
                  <h3 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg lg:text-xl text-gray-800 tracking-wider mb-3 text-center">
                    {result.name}
                  </h3>
                  <div className="text-center mb-3">
                    <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl lg:text-3xl text-gray-800 tracking-wider leading-none">
                      {result.score}ms
                    </div>
                    <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xs lg:text-sm text-gray-800 opacity-70 mt-1">
                      반응 속도
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 lg:p-6 bg-card/50 backdrop-blur-sm border-t border-border relative z-20">
          <button
            className="relative bg-gradient-to-r from-[#ff6b6b] to-[#ff5252] hover:from-[#ff5252] hover:to-[#e74c3c] text-white px-6 py-3 rounded-[25px] shadow-lg transition-all duration-300"
            onClick={onGameEnd}
          >
            <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg tracking-wider">
              나가기
            </span>
          </button>

          <button
            className="relative bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] hover:from-[#5ab4d8] hover:to-[#4aa2c8] text-white px-8 py-4 rounded-[25px] shadow-lg transition-all duration-300"
            onClick={onGameEnd}
          >
            <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl tracking-wider">
              🏆 최종 결과 보기
            </span>
          </button>
        </div>
      </div>
    );
  }

  // 기존 GameData 형식 처리
  const currentResult = gameData?.roundResults?.[gameData.roundResults.length - 1];

  if (!currentResult) {
    return <div>라운드 결과를 찾을 수 없습니다.</div>;
  }

  // 순위별로 정렬된 플레이어들
  const sortedRankings = [...currentResult.rankings].sort(
    (a, b) => a.rank - b.rank
  );

  // 게임 타입별 성과 메시지와 단위
  const getGameTypeInfo = (gameType: string) => {
    switch (gameType) {
      // BringIt 게임
      case "bring_object":
        return {
          name: "BringIt",
          icon: "🔍",
          unit: "점",
          description: "완료 시간",
        };

      // DrawIt 게임
      case "drawing":
        return {
          name: "DrawIt",
          icon: "🧠",
          unit: "점",
          description: "유사도 분석",
        };

      // FingerIt 게임
      case "reaction_time":
        return {
          name: "FingerIt",
          icon: "⚡",
          unit: "ms",
          description: "반응 속도",
        };

      default:
        return {
          name: "게임",
          icon: "🎮",
          unit: "점",
          description: "점수",
        };
    }
  };

  const gameInfo = getGameTypeInfo(currentResult.gameType);
  const isLastRound = isLastRoundGlobal;

  // 순위별 색상과 아이콘
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bgColor: "bg-gradient-to-br from-[#ffd700] to-[#ffed4e]",
          textColor: "text-white",
          icon: Crown,
          borderColor: "border-[#ffd700]",
          shadowColor: "shadow-[#ffd700]/50",
        };
      case 2:
        return {
          bgColor: "bg-gradient-to-br from-[#c0c0c0] to-[#e8e8e8]",
          textColor: "text-gray-800",
          icon: Trophy,
          borderColor: "border-[#c0c0c0]",
          shadowColor: "shadow-gray-400/50",
        };
      case 3:
        return {
          bgColor: "bg-gradient-to-br from-[#cd7f32] to-[#daa520]",
          textColor: "text-white",
          icon: Medal,
          borderColor: "border-[#cd7f32]",
          shadowColor: "shadow-orange-400/50",
        };
      default:
        return {
          bgColor: "bg-gradient-to-br from-[#6dc4e8] to-[#5ab4d8]",
          textColor: "text-white",
          icon: Award,
          borderColor: "border-[#6dc4e8]",
          shadowColor: "shadow-blue-400/50",
        };
    }
  };

  return (
    <div className="bg-background text-foreground h-screen w-full relative overflow-hidden flex flex-col transition-colors duration-300">
      {/* 배경 그라데이션 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[rgba(109,196,232,0.05)] via-transparent to-[rgba(109,196,232,0.1)] dark:from-[rgba(109,196,232,0.02)] dark:to-[rgba(109,196,232,0.05)] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* 축하 파티클 효과 */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full z-10"
          style={{
            backgroundColor:
              i % 3 === 0 ? "#ffd700" : i % 3 === 1 ? "#6dc4e8" : "#ff6b6b",
            left: `${Math.random() * 100}%`,
            top: "-20px",
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            rotate: [0, 360],
            opacity: [1, 0.3, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut",
          }}
        />
      ))}

      {/* 상단 헤더 */}
      <motion.div
        className="flex-shrink-0 text-center py-6 relative z-20"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="bg-card/80 backdrop-blur-sm inline-block px-8 py-4 rounded-[25px] shadow-lg border-2 border-[#6dc4e8]/30">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl">{gameInfo.icon}</span>
            <h1 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl lg:text-3xl text-[#6dc4e8] tracking-wider">
              라운드 {gameData.currentRound} 결과
            </h1>
          </div>
          <p className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-base lg:text-lg text-muted-foreground tracking-wider">
            {gameInfo.name}
          </p>
        </div>
      </motion.div>

      {/* 메인 순위 결과 */}
      <div className="flex-1 px-4 lg:px-8 pb-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* 1등 카드 (큰 크기) */}
          {sortedRankings.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
            >
              {(() => {
                const ranking = sortedRankings[0];
                const player = gameData.players.find(
                  (p: Player) => p.id === ranking.playerId
                );
                const style = getRankStyle(ranking.rank);
                const Icon = style.icon;

                if (!player) return null;

                return (
                  <div
                    className={`relative ${style.bgColor} rounded-[25px] p-6 lg:p-8 shadow-2xl border-4 ${style.borderColor} overflow-hidden`}
                  >
                    {/* 배경 파티클 */}
                    <motion.div
                      className="absolute inset-0 opacity-20"
                      animate={{
                        background: [
                          "radial-gradient(circle at 20% 80%, white 1px, transparent 1px)",
                          "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                          "radial-gradient(circle at 40% 40%, white 1px, transparent 1px)",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />

                    <div className="relative z-10 text-center">
                      {/* 왕관과 순위 */}
                      <motion.div
                        className="flex items-center justify-center gap-3 mb-4"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Icon
                          className={`w-8 h-8 lg:w-10 lg:h-10 ${style.textColor}`}
                        />
                        <span
                          className={`font-['BM_HANNA_TTF:Regular',_sans-serif] text-3xl lg:text-4xl ${style.textColor} tracking-wider`}
                        >
                          1등
                        </span>
                        <Icon
                          className={`w-8 h-8 lg:w-10 lg:h-10 ${style.textColor}`}
                        />
                      </motion.div>

                      {/* 플레이어 이름 */}
                      <motion.h2
                        className={`font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl lg:text-3xl ${style.textColor} tracking-wider mb-4`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                      >
                        {player.name}
                      </motion.h2>

                                             {/* 점수 */}
                       <motion.div
                         className="bg-white/20 backdrop-blur-sm rounded-[20px] px-6 py-4 inline-block mb-4"
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{
                           delay: 1.2,
                           duration: 0.6,
                           type: "spring",
                         }}
                       >
                         <div
                           className={`font-['BM_HANNA_TTF:Regular',_sans-serif] text-4xl lg:text-5xl ${style.textColor} tracking-wider leading-none`}
                         >
                           +{ranking.score}점
                         </div>
                         <div
                           className={`font-['BM_HANNA_TTF:Regular',_sans-serif] text-sm lg:text-base ${style.textColor} opacity-80 mt-1`}
                         >
                           라운드 점수
                         </div>
                       </motion.div>
                       
                       {ranking.performance && (
                         <motion.div
                           className={`bg-white/20 backdrop-blur-sm rounded-[20px] px-6 py-3 inline-block ml-4 mb-4`}
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           transition={{ delay: 1.4, duration: 0.6, type: "spring" }}
                         >
                           <div className={`font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl lg:text-2xl ${style.textColor} tracking-wider`}>
                             {ranking.performance}
                           </div>
                         </motion.div>
                       )}

                       
                    </div>

                    {/* 글로우 효과 */}
                    <motion.div
                      className={`absolute inset-0 rounded-[25px] border-2 ${style.borderColor}`}
                      animate={{
                        boxShadow: [
                          `0 0 20px ${
                            style.borderColor.includes("ffd700")
                              ? "rgba(255,215,0,0.5)"
                              : "rgba(192,192,192,0.5)"
                          }`,
                          `0 0 40px ${
                            style.borderColor.includes("ffd700")
                              ? "rgba(255,215,0,0.8)"
                              : "rgba(192,192,192,0.8)"
                          }`,
                          `0 0 20px ${
                            style.borderColor.includes("ffd700")
                              ? "rgba(255,215,0,0.5)"
                              : "rgba(192,192,192,0.5)"
                          }`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* 2-6등 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {sortedRankings.slice(1).map((ranking, index) => {
              const player = gameData.players.find(
                (p: Player) => p.id === ranking.playerId
              );
              const style = getRankStyle(ranking.rank);
              const Icon = style.icon;

              if (!player) return null;

              return (
                <motion.div
                  key={player.id}
                  className={`relative ${style.bgColor} rounded-[20px] p-4 lg:p-6 shadow-xl border-3 ${style.borderColor} overflow-hidden`}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: 0.8 + index * 0.1,
                    duration: 0.6,
                    type: "spring",
                  }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* 순위 표시 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-5 h-5 lg:w-6 lg:h-6 ${style.textColor}`}
                      />
                      <span
                        className={`font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl lg:text-2xl ${style.textColor} tracking-wider`}
                      >
                        {ranking.rank}등
                      </span>
                    </div>

                    {/* 라운드 점수 */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-[10px] px-2 py-1">
                      <span
                        className={`font-['BM_HANNA_TTF:Regular',_sans-serif] text-sm ${style.textColor} opacity-80`}
                      >
                        {ranking.score}점
                      </span>
                    </div>
                  </div>

                  {/* 플레이어 이름 */}
                  <h3
                    className={`font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg lg:text-xl ${style.textColor} tracking-wider mb-3 text-center`}
                  >
                    {player.name}
                  </h3>

                                     {/* 점수 */}
                   <div className="text-center mb-3">
                     <div
                       className={`font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl lg:text-3xl ${style.textColor} tracking-wider leading-none`}
                     >
                       +{ranking.score}점
                     </div>
                     <div
                       className={`font-['BM_HANNA_TTF:Regular',_sans-serif] text-xs lg:text-sm ${style.textColor} opacity-70 mt-1`}
                     >
                       라운드 점수
                     </div>
                   </div>
                   
                   {ranking.performance && (
                     <div className="text-center mb-4">
                       <div className={`bg-white/10 rounded-full px-3 py-1 inline-block font-['BM_HANNA_TTF:Regular',_sans-serif] text-sm lg:text-base ${style.textColor}`}>
                         {ranking.performance}
                       </div>
                     </div>
                   )}

                   

                  {/* 작은 반짝임 효과 */}
                  <motion.div
                    className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-60"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <motion.div
        className="flex-shrink-0 flex justify-between items-center p-4 lg:p-6 bg-card/50 backdrop-blur-sm border-t border-border relative z-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        {/* 나가기 버튼 */}
        <motion.button
          className="relative bg-gradient-to-r from-[#ff6b6b] to-[#ff5252] hover:from-[#ff5252] hover:to-[#e74c3c] text-white px-6 py-3 rounded-[25px] shadow-lg transition-all duration-300 overflow-hidden group"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 25px rgba(255,107,107,0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onGameEnd}
        >
          <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg tracking-wider relative z-10">
            나가기
          </span>

          <motion.div
            className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
            animate={{ x: ["-120%", "120%"] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut",
            }}
          />
        </motion.button>

        {/* 게임 정보 */}
        <div className="hidden sm:flex items-center gap-4 bg-card/70 backdrop-blur-sm px-4 py-2 rounded-[20px]">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#6dc4e8]" />
            <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-sm text-muted-foreground">
              {gameData.currentRound}/{gameData.totalRounds} 라운드
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6dc4e8]" />
            <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-sm text-muted-foreground">
              {gameInfo.name}
            </span>
          </div>
        </div>

        {/* 다음 라운드/최종 결과 버튼 */}
        <motion.button
          className="relative bg-gradient-to-r from-[#6dc4e8] to-[#5ab4d8] hover:from-[#5ab4d8] hover:to-[#4aa2c8] text-white px-8 py-4 rounded-[25px] shadow-lg transition-all duration-300 overflow-hidden group"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px rgba(109,196,232,0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={isLastRoundGlobal ? onGameEnd : onNextRound}
        >
          <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl tracking-wider relative z-10">
            {isLastRound ? "🏆 최종 결과 보기" : "➡️ 다음 라운드"}
          </span>

          <motion.div
            className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
            animate={{ x: ["-120%", "120%"] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-[25px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          />
        </motion.button>
      </motion.div>
    </div>
  );
}
