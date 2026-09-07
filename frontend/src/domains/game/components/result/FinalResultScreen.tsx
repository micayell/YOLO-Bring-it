import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Trophy, Medal, Star, Home, RotateCcw, Award, TrendingUp, Target, ChevronDown, ChevronUp, BarChart3, Users, Clock, Zap, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { GameData } from "@/shared/types/game";
import { useUserLoginStore } from "@/domains/user/stores/userStore";
import { saveFinalScore, saveYoloUp, saveYoloDown } from "@/domains/game/services/scoreService";

interface FinalResultScreenProps {
  gameData: GameData;
  onGameEnd: () => void;
  onRestartGame?: () => void;
  roomId?: string;
}

const rankColors = {
  1: "#ffd700", // 금색
  2: "#c0c0c0", // 은색  
  3: "#cd7f32", // 동색
};

const rankIcons = {
  1: Crown,
  2: Trophy,
  3: Medal,
};

const gameTypeNames: Record<string, string> = {
  bring_object: "Bring It",
  expression: "Face It",
  color_similar: "Color It",
  drawing: "Draw It",
  quick_press: "Finger It",
  timing_click: "Time It",
  blink: "Blink Battle",
  forbidden_word: "Trap Word",
  famous_line: "음성 모사",
  headbanging: "헤드뱅잉"
};

export function FinalResultScreen({ gameData, onGameEnd, onRestartGame, roomId }: FinalResultScreenProps) {
  const [showResults, setShowResults] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"ranking" | "rounds" | "stats">("ranking");
  const [showCelebration, setShowCelebration] = useState(false);
  const [votedPlayers, setVotedPlayers] = useState<Set<string | number>>(new Set());
  const [finalRankings, setFinalRankings] = useState<any[]>([]);

  // 웹소켓 및 인증 훅
  const { userData } = useUserLoginStore();

  useEffect(() => {
    // API 호출로 최종 점수를 저장하고 순위 데이터를 받아옴
    const fetchAndSetFinalScores = async () => {
      if (roomId && userData?.memberUid) {
        try {
          // 최종 점수 저장 API 호출하고 서버로부터 최종 순위 데이터를 받아옴
          const response = await saveFinalScore(parseInt(roomId as string), userData?.memberUid as number);
          console.log("🏆 최종 점수 데이터 수신:", response.data);

          // API 응답 데이터가 비어있으면 catch 블록으로 넘어가 로컬 폴백 수행
          if (response.data && response.data.length > 0) {
            setFinalRankings(response.data);
          } else {
            console.warn("Backend returned empty final scores. Falling back to local gameData.");
            throw new Error("Empty final scores");
          }

        } catch (error) {
          console.error("🔴 최종 점수 정보를 가져오는데 실패했습니다. 로컬 데이터로 대체합니다.", error);
          // API 호출 실패 시, 기존 로직으로 순위 계산 (Fallback)
          const localRankings = gameData.players
            .map(player => ({
              ...player,
              finalRank: 0
            }))
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((player, index) => ({
              ...player,
              finalRank: index + 1
            }));
          setFinalRankings(localRankings);
        } finally {
          // 결과 애니메이션 시작
          const timer = setTimeout(() => setShowResults(true), 1000);
          return () => clearTimeout(timer);
        }
      }
    };

    fetchAndSetFinalScores();
  }, [roomId, userData?.memberUid, gameData.players]);

  useEffect(() => {
    if (showResults && currentPlayerIndex < finalRankings.length) {
      const timer = setTimeout(() => {
        setCurrentPlayerIndex(prev => prev + 1);
      }, 800);

      return () => clearTimeout(timer);
    } else if (currentPlayerIndex >= finalRankings.length) {
      const timer = setTimeout(() => {
        setShowStats(true);
        setShowCelebration(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [showResults, currentPlayerIndex, finalRankings.length]);

  const getRankIcon = (rank: number) => {
    const Icon = rankIcons[rank as keyof typeof rankIcons] || Star;
    return Icon;
  };

  const getRankColor = (rank: number) => {
    return rankColors[rank as keyof typeof rankColors] || "#6dc4e8";
  };

  const currentUser = finalRankings.find(p => p.isCurrentUser);
  const userRank = currentUser?.finalRank || 1;

  // 개인 통계 계산
  const userStats = {
    totalScore: currentUser?.totalScore || 0,
    averageScore: currentUser ? Math.round(currentUser.totalScore / gameData.totalRounds) : 0,
    bestRound: currentUser ? Math.max(...currentUser.roundScores) : 0,
    worstRound: currentUser ? Math.min(...currentUser.roundScores) : 0,
    roundsWon: gameData.roundResults.filter(result => 
      result.rankings.find(r => r.playerId === currentUser?.id)?.rank === 1
    ).length,
    roundsTop3: gameData.roundResults.filter(result => {
      const userRanking = result.rankings.find(r => r.playerId === currentUser?.id);
      return userRanking?.rank && userRanking.rank <= 3;
    }).length,
    consistency: currentUser ? Math.round(100 - (Math.max(...currentUser.roundScores) - Math.min(...currentUser.roundScores))) : 0
  };

  // 게임 전체 통계
  const gameStats = {
    totalPlayers: finalRankings.length,
    totalRounds: gameData.totalRounds,
    averageScore: Math.round(finalRankings.reduce((sum, p) => sum + p.totalScore, 0) / finalRankings.length),
    highestScore: Math.max(...finalRankings.map(p => p.totalScore)),
    mostCompetitiveRound: gameData.roundResults.reduce((prev, current) => {
      const prevRange = Math.max(...prev.rankings.map(r => r.score)) - Math.min(...prev.rankings.map(r => r.score));
      const currentRange = Math.max(...current.rankings.map(r => r.score)) - Math.min(...current.rankings.map(r => r.score));
      return prevRange < currentRange ? prev : current;
    })
  };

  const handleViewDetailedResults = () => {
    setShowDetailedStats(!showDetailedStats);
  };

  const handleRestartGame = () => {
    if (onRestartGame) {
      onRestartGame();
    } else {
      onGameEnd();
    }
  };

  // 칭찬 점수 (좋아요) 핸들러
  const handleYoloUp = async (playerId: string | number) => {
    if (!roomId || !userData?.memberUid) {
      console.warn('❌ 방 ID 또는 사용자 정보가 없습니다.');
      return;
    }

    const numericPlayerId = typeof playerId === 'string' ? parseInt(playerId) : playerId;

    if (votedPlayers.has(numericPlayerId)) {
      console.warn('❌ 이미 투표한 플레이어입니다.');
      return;
    }

    try {
      await saveYoloUp(numericPlayerId, { roomId: parseInt(roomId as string) });
      setVotedPlayers(prev => new Set(prev).add(numericPlayerId));
      console.log('👍 칭찬 점수 전송 완료:', numericPlayerId);
    } catch (error) {
      console.error('🔴 칭찬 점수 저장 실패:', error);
    }
  };

  // 불쾌 점수 (싫어요) 핸들러
  const handleYoloDown = async (playerId: string | number) => {
    if (!roomId || !userData?.memberUid) {
      console.warn('❌ 방 ID 또는 사용자 정보가 없습니다.');
      return;
    }

    const numericPlayerId = typeof playerId === 'string' ? parseInt(playerId) : playerId;

    if (votedPlayers.has(numericPlayerId)) {
      console.warn('❌ 이미 투표한 플레이어입니다.');
      return;
    }

    try {
      await saveYoloDown(numericPlayerId, { roomId: parseInt(roomId as string) });
      setVotedPlayers(prev => new Set(prev).add(numericPlayerId));
      console.log('👎 불쾌 점수 전송 완료:', numericPlayerId);
    } catch (error) {
      console.error('🔴 불쾌 점수 저장 실패:', error);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-[rgba(109,196,232,0.1)] via-background to-[rgba(109,196,232,0.05)] dark:from-[rgba(109,196,232,0.02)] dark:via-background dark:to-[rgba(109,196,232,0.02)] relative overflow-hidden transition-colors duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 배경 효과 - 승리 축하 */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {/* 컨페티 효과 */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#ffd700', '#ff6b6b', '#6bcf7f', '#6dc4e8', '#a78bfa'][Math.floor(Math.random() * 5)],
                  left: `${Math.random() * 100}%`,
                  top: '-20px'
                }}
                animate={{
                  y: [0, window.innerHeight + 100],
                  rotate: [0, 360 * 3],
                  opacity: [1, 0]
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            ))}

            {/* 폭죽 효과 */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`firework-${i}`}
                className="absolute"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${30 + Math.random() * 40}%`
                }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0] }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 4
                }}
              >
                {[...Array(8)].map((_, j) => (
                  <motion.div
                    key={j}
                    className="absolute w-2 h-2 bg-[#ffd700] rounded-full"
                    animate={{
                      x: Math.cos((j * Math.PI * 2) / 8) * 50,
                      y: Math.sin((j * Math.PI * 2) / 8) * 50,
                      opacity: [1, 0]
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* 헤더 */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-4 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] px-12 py-6 rounded-[40px] shadow-2xl mb-6"
            animate={showCelebration ? {
              boxShadow: [
                "0 0 30px rgba(255,215,0,0.5)",
                "0 0 50px rgba(255,215,0,0.8)",
                "0 0 30px rgba(255,215,0,0.5)"
              ],
              scale: [1, 1.02, 1]
            } : {}}
            transition={{
              duration: 2,
              repeat: showCelebration ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <Trophy className="w-12 h-12 text-white" />
            <h1 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-4xl text-white tracking-wider">
              🎉 게임 완료!
            </h1>
          </motion.div>
          
          <p className="text-xl text-muted-foreground font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider">
            {gameData.totalRounds}라운드 게임이 완료되었습니다!
          </p>
        </motion.div>

        {/* 탭 네비게이션 */}
        {showStats && (
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex bg-card/80 backdrop-blur-sm rounded-[25px] p-2 shadow-lg border border-border">
              {[
                { key: "ranking", label: "최종 순위", icon: Trophy },
                { key: "rounds", label: "라운드별", icon: BarChart3 },
                { key: "stats", label: "상세 통계", icon: Target }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={selectedTab === key ? "default" : "ghost"}
                  className={`relative px-6 py-3 rounded-[20px] font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider transition-all duration-300 ${
                    selectedTab === key 
                      ? 'bg-[#6dc4e8] text-white shadow-lg' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setSelectedTab(key as any)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                  {selectedTab === key && (
                    <motion.div
                      className="absolute inset-0 bg-[#6dc4e8] rounded-[20px] -z-10"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {/* 최종 순위 탭 */}
            {selectedTab === "ranking" && (
              <motion.div
                key="ranking"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* 최종 순위 */}
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-[#6dc4e8] tracking-wider mb-6 text-center">
                    🏆 최종 순위
                  </h2>
                  
                  <AnimatePresence>
                    {finalRankings.slice(0, currentPlayerIndex).map((player, index) => {
                      const RankIcon = getRankIcon(player.finalRank);
                      const rankColor = getRankColor(player.finalRank);

                      return (
                        <motion.div
                          key={player.id}
                          layout
                          initial={{ 
                            x: player.finalRank === 1 ? 0 : player.finalRank <= 3 ? -300 : 300, 
                            opacity: 0, 
                            scale: player.finalRank === 1 ? 1.1 : 0.8 
                          }}
                          animate={{ x: 0, opacity: 1, scale: 1 }}
                          transition={{ 
                            delay: index * 0.2,
                            duration: 0.8,
                            type: "spring",
                            stiffness: 100
                          }}
                          className={`relative flex items-center gap-6 bg-card/80 backdrop-blur-sm rounded-[25px] p-6 shadow-lg border-2 overflow-hidden ${
                            player.finalRank === 1 
                              ? 'border-[#ffd700] shadow-2xl transform scale-105' 
                              : player.finalRank <= 3 
                              ? 'border-opacity-50' 
                              : 'border-transparent hover:border-[#6dc4e8]'
                          }`}
                          style={{
                            borderColor: player.finalRank <= 3 ? rankColor : undefined
                          }}
                          whileHover={{ y: -5, scale: player.finalRank === 1 ? 1.05 : 1.02 }}
                        >
                          {/* 순위 */}
                          <motion.div
                            className={`flex-shrink-0 rounded-full flex items-center justify-center border-4 ${
                              player.finalRank === 1 ? 'w-20 h-20' : 'w-16 h-16'
                            }`}
                            style={{
                              backgroundColor: `${rankColor}20`,
                              borderColor: rankColor
                            }}
                            animate={player.finalRank <= 3 ? {
                              boxShadow: [
                                `0 0 20px ${rankColor}40`,
                                `0 0 40px ${rankColor}80`,
                                `0 0 20px ${rankColor}40`
                              ]
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            {player.finalRank <= 3 ? (
                              <RankIcon 
                                className={player.finalRank === 1 ? "w-10 h-10" : "w-8 h-8"} 
                                style={{ color: rankColor }} 
                              />
                            ) : (
                              <span 
                                className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl tracking-wider"
                                style={{ color: rankColor }}
                              >
                                {player.finalRank}
                              </span>
                            )}
                          </motion.div>

                          {/* 플레이어 정보 */}
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`rounded-full bg-muted flex items-center justify-center overflow-hidden ${
                              player.finalRank === 1 ? 'w-16 h-16' : 'w-12 h-12'
                            }`}>
                              <img
                                src={player.avatar}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <h3 className={`font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider mb-1 text-foreground ${
                                player.finalRank === 1 ? 'text-2xl' : 'text-xl'
                              }`}>
                                {player.name}
                                {player.isCurrentUser && (
                                  <span className="ml-2 text-sm bg-[#6dc4e8] text-white px-2 py-1 rounded-lg">
                                    나
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>총점: {player.totalScore}점</span>
                                <span>평균: {Math.round(player.totalScore / gameData.totalRounds)}점</span>
                              </div>
                            </div>
                          </div>

                          {/* 라운드별 점수 */}
                          <div className="text-right">
                            <div className={`font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider mb-2 ${
                              player.finalRank === 1 ? 'text-3xl' : 'text-2xl'
                            }`}
                                 style={{ color: rankColor }}>
                              {player.totalScore}점
                            </div>
                            <div className="flex gap-1">
                              {player.roundScores.map((score: number, i: number) => (
                                <div 
                                  key={i}
                                  className="w-6 h-6 bg-muted rounded text-xs flex items-center justify-center"
                                  style={{ 
                                    backgroundColor: score >= 60 ? '#6bcf7f' : score >= 40 ? '#ffd93d' : '#ff6b6b',
                                    color: 'white'
                                  }}
                                >
                                  {score}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 좋아요/싫어요 버튼 - 자신이 아닌 경우에만 표시 */}
                          {!player.isCurrentUser && (
                            <div className="flex gap-2 ml-4">
                              <motion.button
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  votedPlayers.has(player.id)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                                }`}
                                onClick={() => handleYoloUp(player.id)}
                                disabled={votedPlayers.has(player.id)}
                                whileHover={!votedPlayers.has(player.id) ? { scale: 1.05 } : {}}
                                whileTap={!votedPlayers.has(player.id) ? { scale: 0.95 } : {}}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>+10</span>
                              </motion.button>
                              
                              <motion.button
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  votedPlayers.has(player.id)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                                }`}
                                onClick={() => handleYoloDown(player.id)}
                                disabled={votedPlayers.has(player.id)}
                                whileHover={!votedPlayers.has(player.id) ? { scale: 1.05 } : {}}
                                whileTap={!votedPlayers.has(player.id) ? { scale: 0.95 } : {}}
                              >
                                <ThumbsDown className="w-4 h-4" />
                                <span>-10</span>
                              </motion.button>
                            </div>
                          )}

                          {/* 1등 특별 효과 */}
                          {player.finalRank === 1 && (
                            <>
                              <motion.div
                                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[rgba(255,215,0,0.4)] to-transparent -skew-x-12 pointer-events-none"
                                animate={{ x: ["-120%", "120%"] }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  repeatDelay: 2,
                                  ease: "easeInOut"
                                }}
                              />
                              <div className="absolute -top-2 -left-2 text-2xl">👑</div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* 개인 통계 - 오른쪽 사이드바 */}
                <div className="lg:col-span-1">
                  <AnimatePresence>
                    {showStats && (
                      <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-6"
                      >
                        <h2 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-[#6dc4e8] tracking-wider text-center">
                          📊 나의 기록
                        </h2>

                        {/* 최종 순위 카드 */}
                        <motion.div
                          className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-[25px] p-6 shadow-lg border-2 border-[#6dc4e8]/30"
                          animate={{
                            boxShadow: ["0 0 20px rgba(109,196,232,0.3)", "0 0 30px rgba(109,196,232,0.5)", "0 0 20px rgba(109,196,232,0.3)"]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-2">
                              {userRank === 1 ? "🥇" : userRank === 2 ? "🥈" : userRank === 3 ? "🥉" : "🏅"}
                            </div>
                            <h3 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-3xl tracking-wider" 
                                style={{ color: getRankColor(userRank) }}>
                              {userRank}등
                            </h3>
                            <p className="text-muted-foreground">최종 순위</p>
                          </div>
                        </motion.div>

                        {/* 상세 통계 */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-card/80 backdrop-blur-sm rounded-[20px] p-4 shadow-lg text-center">
                            <TrendingUp className="w-8 h-8 text-[#6dc4e8] mx-auto mb-2" />
                            <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-[#6dc4e8] tracking-wider">
                              {userStats.totalScore}
                            </div>
                            <p className="text-sm text-muted-foreground">총점</p>
                          </div>

                          <div className="bg-card/80 backdrop-blur-sm rounded-[20px] p-4 shadow-lg text-center">
                            <Target className="w-8 h-8 text-[#6bcf7f] mx-auto mb-2" />
                            <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-[#6bcf7f] tracking-wider">
                              {userStats.averageScore}
                            </div>
                            <p className="text-sm text-muted-foreground">평균점수</p>
                          </div>

                          <div className="bg-card/80 backdrop-blur-sm rounded-[20px] p-4 shadow-lg text-center">
                            <Star className="w-8 h-8 text-[#ffd93d] mx-auto mb-2" />
                            <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-[#ffd93d] tracking-wider">
                              {userStats.bestRound}
                            </div>
                            <p className="text-sm text-muted-foreground">최고점수</p>
                          </div>

                          <div className="bg-card/80 backdrop-blur-sm rounded-[20px] p-4 shadow-lg text-center">
                            <Award className="w-8 h-8 text-[#ff6b6b] mx-auto mb-2" />
                            <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-[#ff6b6b] tracking-wider">
                              {userStats.roundsWon}
                            </div>
                            <p className="text-sm text-muted-foreground">1등 횟수</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* 라운드별 결과 탭 */}
            {selectedTab === "rounds" && showStats && (
              <motion.div
                key="rounds"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h2 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-[#6dc4e8] tracking-wider text-center">
                  🎯 라운드별 결과
                </h2>

                <div className="grid gap-4">
                  {gameData.roundResults.map((round, index) => (
                    <motion.div
                      key={round.round}
                      className="bg-card/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg border border-border"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg tracking-wider text-foreground">
                          라운드 {round.round}: {gameTypeNames[round.gameType as keyof typeof gameTypeNames]}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          {round.rankings.length}명 참가
                        </div>
                      </div>

                      <div className="space-y-2">
                        {round.rankings.slice(0, 3).map((ranking, rankIndex) => {
                          const player = finalRankings.find(p => String(p.id) === String(ranking.playerId)) || gameData.players.find(p => String(p.id) === String(ranking.playerId));
                          return (
                            <div 
                              key={ranking.playerId}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                player?.isCurrentUser ? 'bg-[#6dc4e8]/20 border border-[#6dc4e8]/30' : 'bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  rankIndex === 0 ? 'bg-[#ffd700]' : 
                                  rankIndex === 1 ? 'bg-[#c0c0c0]' : 
                                  'bg-[#cd7f32]'
                                } text-white font-bold`}>
                                  {ranking.rank}
                                </div>
                                <span className="font-medium">{player?.name}</span>
                                {player?.isCurrentUser && (
                                  <span className="text-xs bg-[#6dc4e8] text-white px-2 py-1 rounded">나</span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-[#6dc4e8]">{ranking.score}점</div>
                                {ranking.performance && (
                                  <div className="text-xs text-muted-foreground">
                                    {ranking.performance}
                                    {round.gameType === 'forbidden_word' || round.gameType === 'drawing' ? '점' :
                                     round.gameType === 'blink' || round.gameType === 'color_similar' || round.gameType === 'timing_click' ? '초' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 상세 통계 탭 */}
            {selectedTab === "stats" && showStats && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h2 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-2xl text-[#6dc4e8] tracking-wider text-center">
                  📈 상세 통계
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 개인 상세 통계 */}
                  <div className="space-y-4">
                    <h3 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl tracking-wider text-center">
                      👤 개인 기록
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card/80 backdrop-blur-sm rounded-[15px] p-4 text-center">
                        <TrendingUp className="w-6 h-6 text-[#6dc4e8] mx-auto mb-2" />
                        <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl text-[#6dc4e8]">
                          {userStats.totalScore}
                        </div>
                        <p className="text-xs text-muted-foreground">총점</p>
                      </div>

                      <div className="bg-card/80 backdrop-blur-sm rounded-[15px] p-4 text-center">
                        <Target className="w-6 h-6 text-[#6bcf7f] mx-auto mb-2" />
                        <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl text-[#6bcf7f]">
                          {userStats.averageScore}
                        </div>
                        <p className="text-xs text-muted-foreground">평균</p>
                      </div>

                      <div className="bg-card/80 backdrop-blur-sm rounded-[15px] p-4 text-center">
                        <Star className="w-6 h-6 text-[#ffd93d] mx-auto mb-2" />
                        <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl text-[#ffd93d]">
                          {userStats.bestRound}
                        </div>
                        <p className="text-xs text-muted-foreground">최고점수</p>
                      </div>

                      <div className="bg-card/80 backdrop-blur-sm rounded-[15px] p-4 text-center">
                        <Zap className="w-6 h-6 text-[#ff6b6b] mx-auto mb-2" />
                        <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl text-[#ff6b6b]">
                          {userStats.worstRound}
                        </div>
                        <p className="text-xs text-muted-foreground">최저점수</p>
                      </div>

                      <div className="bg-card/80 backdrop-blur-sm rounded-[15px] p-4 text-center">
                        <Award className="w-6 h-6 text-[#a78bfa] mx-auto mb-2" />
                        <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl text-[#a78bfa]">
                          {userStats.roundsWon}
                        </div>
                        <p className="text-xs text-muted-foreground">1등 횟수</p>
                      </div>

                      <div className="bg-card/80 backdrop-blur-sm rounded-[15px] p-4 text-center">
                        <Medal className="w-6 h-6 text-[#ff8c42] mx-auto mb-2" />
                        <div className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl text-[#ff8c42]">
                          {userStats.roundsTop3}
                        </div>
                        <p className="text-xs text-muted-foreground">상위3등 횟수</p>
                      </div>
                    </div>

                    {/* 라운드별 성과 그래프 */}
                    <div className="bg-card/80 backdrop-blur-sm rounded-[15px] p-4">
                      <h4 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg text-center mb-4 tracking-wider text-foreground">
                        라운드별 성과
                      </h4>
                      <div className="space-y-2">
                        {currentUser?.roundScores.map((score: number, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">R{index + 1}</span>
                            <div className="flex items-center gap-2 flex-1 mx-3">
                              <div className="w-full bg-muted rounded-full h-2">
                                <motion.div 
                                  className="h-2 rounded-full"
                                  style={{ 
                                    backgroundColor: score >= 60 ? '#6bcf7f' : score >= 40 ? '#ffd93d' : '#ff6b6b'
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(score / 70) * 100}%` }}
                                  transition={{ delay: index * 0.1, duration: 0.8 }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-[#6dc4e8]">{score}점</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 게임 전체 통계 */}
                  <div className="space-y-4">
                    <h3 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-xl tracking-wider text-center">
                      🎮 게임 통계
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-card/80 backdrop-blur-sm rounded-[15px] p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Users className="w-6 h-6 text-[#6dc4e8]" />
                          <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider">참가자 정보</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>총 참가자: <span className="font-bold text-[#6dc4e8]">{gameStats.totalPlayers}명</span></div>
                          <div>총 라운드: <span className="font-bold text-[#6bcf7f]">{gameStats.totalRounds}라운드</span></div>
                        </div>
                      </div>

                      <div className="bg-card/80 backdrop-blur-sm rounded-[15px] p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <BarChart3 className="w-6 h-6 text-[#ffd93d]" />
                          <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider">점수 통계</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>평균 점수:</span>
                            <span className="font-bold text-[#ffd93d]">{gameStats.averageScore}점</span>
                          </div>
                          <div className="flex justify-between">
                            <span>최고 점수:</span>
                            <span className="font-bold text-[#6bcf7f]">{gameStats.highestScore}점</span>
                          </div>
                          <div className="flex justify-between">
                            <span>내 점수 순위:</span>
                            <span className="font-bold text-[#6dc4e8]">{userRank}등</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-card/80 backdrop-blur-sm rounded-[15px] p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Clock className="w-6 h-6 text-[#a78bfa]" />
                          <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] tracking-wider">게임 하이라이트</span>
                        </div>
                        <div className="text-sm">
                          <div className="mb-2">
                            <span className="text-muted-foreground">가장 치열했던 라운드:</span>
                          </div>
                          <div className="font-bold text-[#a78bfa]">
                            라운드 {gameStats.mostCompetitiveRound.round} 
                            ({gameTypeNames[gameStats.mostCompetitiveRound.gameType as keyof typeof gameTypeNames]})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 하단 액션 버튼들 */}
        {currentPlayerIndex >= finalRankings.length && (
          <motion.div
            className="text-center mt-12 space-y-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            {/* 상세 결과 보기 토글 버튼 */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.6 }}
            >
              <Button
                onClick={handleViewDetailedResults}
                className="relative flex items-center gap-2 bg-gradient-to-r from-[#a78bfa] to-[#9f6fff] hover:from-[#9f6fff] hover:to-[#8b54ff] text-white px-8 py-4 rounded-[25px] font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg tracking-wider transition-all duration-300 overflow-hidden shadow-lg"
                size="lg"
              >
                <BarChart3 className="w-5 h-5" />
                <span>{showDetailedStats ? "기본 결과 보기" : "상세 결과 보기"}</span>
                {showDetailedStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                
                <motion.div
                  className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "easeInOut"
                  }}
                />
              </Button>
            </motion.div>

            {/* 메인 액션 버튼들 */}
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                className="relative flex items-center gap-2 bg-[#6dc4e8] hover:bg-[#5ab4d8] text-white px-8 py-4 rounded-[25px] font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg tracking-wider transition-all duration-300 overflow-hidden shadow-lg"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(109,196,232,0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onGameEnd}
              >
                <Home className="w-5 h-5 relative z-10" />
                <span className="relative z-10">로비로 돌아가기</span>
                
                <motion.div
                  className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />
              </motion.button>

              <motion.button
                className="relative flex items-center gap-2 bg-gradient-to-r from-[#6bcf7f] to-[#57c267] hover:from-[#57c267] hover:to-[#4db55a] text-white px-8 py-4 rounded-[25px] font-['BM_HANNA_TTF:Regular',_sans-serif] text-lg tracking-wider transition-all duration-300 overflow-hidden shadow-lg"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(107,207,127,0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestartGame}
              >
                <RotateCcw className="w-5 h-5 relative z-10" />
                <span className="relative z-10">다시 게임하기</span>
                
                <motion.div
                  className="absolute top-0 left-0 w-[120%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "easeInOut"
                  }}
                />
              </motion.button>
            </div>

            <motion.p 
              className="text-muted-foreground text-sm mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 0.6 }}
            >
              🎉 수고하셨습니다! 다음 게임에서 만나요
            </motion.p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}