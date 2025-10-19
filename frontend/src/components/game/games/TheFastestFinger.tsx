import { useState, useEffect, useCallback } from 'react';
import { LocalParticipant, RemoteParticipant } from 'livekit-client';
import { Timer, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ParticipantTile } from "../../../widgets/ParticipantTile";

// 플레이어 결과 인터페이스
interface PlayerResult {
  id: number;
  name: string;
  reactionTime: number | null;
  status: 'waiting' | 'ready' | 'false-start' | 'completed';
}

interface TheFastestFingerProps {
  onRoundComplete?: (data: { playerResults: PlayerResult[] }) => void;
  localParticipant?: LocalParticipant;
  remoteParticipants?: RemoteParticipant[];
}

export function TheFastestFinger({ onRoundComplete, localParticipant, remoteParticipants = [] }: TheFastestFingerProps) {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'go' | 'finished'>('waiting');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [bestTime, setBestTime] = useState<number | null>(null);

  // 참가자 목록이 변경될 때 results 상태 초기화
  useEffect(() => {
    const allParticipants = localParticipant ? [localParticipant, ...remoteParticipants] : remoteParticipants;
    const initialResults: PlayerResult[] = allParticipants.map(p => ({
      id: Number(p.identity),
      name: p.identity,
      reactionTime: null,
      status: 'waiting'
    }));
    // '나'의 ID를 0으로 설정
    const myResult = initialResults.find(r => r.name === localParticipant?.identity);
    if (myResult) {
      myResult.id = 0;
    }
    setResults(initialResults);
  }, [localParticipant, remoteParticipants]);


  // --- 파생 상태 ---
  // 별도 state 대신 results 배열에서 현재 유저의 정보를 파생하여 사용
  const myResult = results.find(r => r.id === 0);
  const myReactionTime = myResult?.reactionTime;
  const isFalseStart = myResult?.status === 'false-start';

  // --- 게임 로직 ---

  // 게임 시작 로직
  const startGame = useCallback(() => {
    setGameState('ready');
    setStartTime(null);
    setResults(prev => prev.map(r => ({ ...r, reactionTime: null, status: 'ready' })));

    // 2~5초 사이 랜덤 딜레이 후 'go' 상태로 변경
    const delay = Math.random() * 3000 + 2000;
    setTimeout(() => {
      setStartTime(Date.now());
      setGameState('go');
      simulateOtherPlayers();
    }, delay);
  }, []);

  // 컴포넌트 마운트 시 3초 후 자동 시작
  useEffect(() => {
    const timer = setTimeout(startGame, 3000);
    return () => clearTimeout(timer);
  }, [startGame]);

  // 다른 플레이어들의 반응 시뮬레이션
  const simulateOtherPlayers = useCallback(() => {
    remoteParticipants.forEach(participant => {
      const reactionTime = Math.random() * 300 + 150; // 150-450ms 사이 반응 속도
      const isParticipantFalseStart = Math.random() < 0.1; // 10% 확률로 부정 출발

      setTimeout(() => {
        setResults(prev => prev.map(r => {
          if (r.name !== participant.identity) return r;
          if (isParticipantFalseStart) {
            return { ...r, status: 'false-start', reactionTime: null };
          }
          return { ...r, status: 'completed', reactionTime: Math.floor(reactionTime) };
        }));
      }, reactionTime);
    });
  }, [remoteParticipants]);

  // 클릭 이벤트 핸들러
  const handleClick = useCallback(() => {
    // 'ready' 상태에서 클릭하면 부정 출발
    if (gameState === 'ready') {
      setGameState('finished');
      setResults(prev => prev.map(r =>
        r.id === 0 ? { ...r, status: 'false-start', reactionTime: null } : r
      ));
      return;
    }

    // 'go' 상태에서 클릭하면 반응 속도 측정
    if (gameState === 'go' && startTime) {
      // 이미 클릭했다면 중복 처리 방지
      if (myResult?.status === 'completed' || myResult?.status === 'false-start') return;

      const reactionTime = Date.now() - startTime;
      setGameState('finished'); // 즉시 'finished' 상태로 변경하여 결과 표시
      setResults(prev => prev.map(r =>
        r.id === 0 ? { ...r, status: 'completed', reactionTime } : r
      ));

      // 최고 기록 업데이트
      if (!bestTime || reactionTime < bestTime) {
        setBestTime(reactionTime);
      }
    }
  }, [gameState, startTime, myResult, bestTime]);

  // 키보드(스페이스바, 엔터) 이벤트 핸들러
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault();
        handleClick();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleClick]);

  // 내가 끝나면 바로 라운드 결과 화면으로 전환
  useEffect(() => {
    if (gameState === 'finished' && (myResult?.status === 'completed' || myResult?.status === 'false-start')) {
      // 3초 후 라운드 결과 화면으로 전환
      const timer = setTimeout(() => {
        if (onRoundComplete) {
          console.log('🎮 TheFastestFinger 게임 완료, 결과 전달:', results);
          // playerResults prop으로 전달
          onRoundComplete({ playerResults: results });
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, myResult, results, onRoundComplete]);

  // --- UI 헬퍼 함수들 ---

  const getBackgroundColor = () => {
    if (isFalseStart) return 'bg-red-500';
    switch (gameState) {
      case 'waiting': return 'bg-gray-600';
      case 'ready': return 'bg-red-500';
      case 'go': return 'bg-green-500';
      case 'finished': return 'bg-blue-500';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = () => {
    if (isFalseStart) return '너무 빨라요! (False Start)';
    if (gameState === 'finished' && myReactionTime) return `${myReactionTime}ms`;
    
    switch (gameState) {
      case 'waiting': return '잠시 후 시작합니다...';
      case 'ready': return '준비...';
      case 'go': return '지금 클릭!';
      case 'finished': return '게임 완료';
      default: return '';
    }
  };

  // 순위 계산 (완료된 사람만 필터링)
  const sortedResults = [...results]
    .filter(r => r.status === 'completed' && r.reactionTime !== null)
    .sort((a, b) => (a.reactionTime ?? Infinity) - (b.reactionTime ?? Infinity));

  const myRank = sortedResults.findIndex(r => r.id === 0) + 1;

  // 로컬 참가자와 원격 참가자를 하나의 배열로 합침
  const allParticipants = localParticipant ? [localParticipant, ...remoteParticipants] : remoteParticipants;

  // 그리드 레이아웃을 위해 6개의 슬롯을 만듭니다.
  const participantSlots = Array.from({ length: 6 }).map((_, i) => allParticipants[i] || null);
  
  // 왼쪽과 오른쪽 컬럼으로 나눕니다 (3명씩)
  const leftParticipants = participantSlots.slice(0, 3);
  const rightParticipants = participantSlots.slice(3, 6);

  return (
    <div className="w-full h-full flex flex-col font-sans bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">⚡</span>
          <span className="font-bold text-lg text-gray-800">빠른 반응</span>
        </div>
        <p className="text-sm text-gray-600">신호가 초록색으로 바뀌면 최대한 빠르게 클릭하세요!</p>
      </div>

      {/* 메인 게임 레이아웃 */}
      <div className="flex-1 flex gap-6 p-6">

        {/* 왼쪽 컬럼 */}
        <div className="flex flex-col gap-4 w-1/6">
          {leftParticipants.map((p, index) => {
            const result = p ? results.find(r => r.name === p.identity) : null;
            const isLocal = p instanceof LocalParticipant;
            return (
              <div key={p?.sid || `left-${index}`} className="flex-1 bg-white border border-gray-300 rounded-xl shadow-sm relative overflow-hidden">
                {p ? (
                  <ParticipantTile
                    livekitParticipant={p}
                    isLocal={isLocal}
                    participant={{
                      identity: p.identity,
                      isConnected: true,
                      hasVideo: p.isCameraEnabled,
                      hasAudio: p.isMicrophoneEnabled,
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-xl" />
                )}
                {p && result && (
                  <div className={`absolute inset-0 flex items-center justify-center text-white text-sm font-medium rounded-xl ${
                    result.status === 'completed' ? 'bg-green-500/90' :
                    result.status === 'false-start' ? 'bg-red-500/90' :
                    'bg-transparent'
                  }`}>
                    {result.status === 'false-start' && <span>❌ 부정출발</span>}
                    {result.status === 'completed' && <span>✅ 완료</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 중앙 게임 영역 */}
        <div 
          className={`flex-1 relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer shadow-lg ${getBackgroundColor()}`} 
          onClick={handleClick}
        >
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.div 
              className="text-center text-white" 
              key={gameState + myResult?.status} 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.4, type: "spring" }}
            >
              {/* 아이콘 */}
              <div className="mb-6">
                {(gameState === 'waiting' || gameState === 'ready') && (
                  <Timer className="w-20 h-20 lg:w-28 lg:h-28 mx-auto animate-pulse text-white/80" />
                )}
                {gameState === 'go' && (
                  <Zap className="w-20 h-20 lg:w-28 lg:h-28 mx-auto animate-bounce text-white" />
                )}
                {isFalseStart && (
                  <span className="text-8xl lg:text-9xl">❌</span>
                )}
                {gameState === 'finished' && !isFalseStart && myReactionTime && (
                  <Trophy className="w-20 h-20 lg:w-28 lg:h-28 mx-auto text-yellow-300" />
                )}
              </div>

              {/* 메인 텍스트 */}
              <h2 className={`font-bold tracking-wide ${
                gameState === 'finished' && myReactionTime && !isFalseStart 
                  ? 'text-7xl lg:text-8xl' 
                  : 'text-3xl lg:text-5xl'
              }`}>
                {getStatusText()}
              </h2>

              {/* 순위 표시 */}
              {gameState === 'finished' && myReactionTime && !isFalseStart && myRank > 0 && (
                <motion.p 
                  className="text-2xl lg:text-3xl font-semibold mt-4 text-white/90"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {myRank}등!
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* 배경 효과 */}
          {gameState === 'go' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* 오른쪽 컬럼 */}
        <div className="flex flex-col gap-4 w-1/6">
          {rightParticipants.map((p, index) => {
            const result = p ? results.find(r => r.name === p.identity) : null;
            const isLocal = p instanceof LocalParticipant; // 오른쪽은 항상 remote
            return (
              <div key={p?.sid || `right-${index}`} className="flex-1 bg-white border border-gray-300 rounded-xl shadow-sm relative overflow-hidden">
                {p ? (
                  <ParticipantTile
                    livekitParticipant={p}
                    isLocal={isLocal}
                    participant={{
                      identity: p.identity,
                      isConnected: true,
                      hasVideo: p.isCameraEnabled,
                      hasAudio: p.isMicrophoneEnabled,
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-xl" />
                )}
                {p && result && (
                  <div className={`absolute inset-0 flex items-center justify-center text-white text-sm font-medium rounded-xl ${
                    result.status === 'completed' ? 'bg-green-500/90' :
                    result.status === 'false-start' ? 'bg-red-500/90' :
                    'bg-transparent'
                  }`}>
                    {result.status === 'false-start' && <span>❌ 부정출발</span>}
                    {result.status === 'completed' && <span>✅ 완료</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
