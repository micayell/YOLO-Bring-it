import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";

import { Camera, Mic, Video, X } from "lucide-react";
import { ParticipantTile } from "../../ParticipantTile";
import { useIsPortrait } from "@/shared/ui/use-window-size";
import { judgeGame } from "@/domains/game/services/gameService";
import { useUserLoginStore } from "@/domains/user/stores/userStore";

interface ColorResult {
  closest_color: string;
  similarity: number;
  similarity_score?: number;
  color_distance?: number;
  target_color?: number[];
}

interface ColorItProps {
  targetColor?: { r: number; g: number; b: number };
  keywords?: Record<string, string>;
  roomId?: number;
  roundIdx?: number;
  timeLeft: number;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isGameActive?: boolean;
  onGameComplete?: (success: boolean, aiResults?: any[], score?: number) => void;
  onGameEnd?: () => void;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  participants?: any[];
}

const colorPrompts = [
  { r: 255, g: 0, b: 0, name: "빨간색" },
  { r: 0, g: 255, b: 0, name: "초록색" },
  { r: 0, g: 0, b: 255, name: "파란색" },
  { r: 255, g: 255, b: 0, name: "노란색" },
  { r: 255, g: 0, b: 255, name: "보라색" },
  { r: 255, g: 165, b: 0, name: "주황색" },
  { r: 255, g: 255, b: 255, name: "흰색" },
  { r: 0, g: 0, b: 0, name: "검은색" }
];

export function ColorIt({
  keywords,
  // targetColor = { r: 0, g: 255, b: 0 }, // 초록색 기본값
  timeLeft,
  videoRef,
  isGameActive = true,
  onGameComplete,
  onGameEnd,
  // isVideoEnabled = true,
  // isAudioEnabled = true,
  onToggleVideo,
  onToggleAudio,
  participants = [],
  roomId,
  roundIdx
  }: ColorItProps) {
  const isPortrait = useIsPortrait();
  
  // AI Color Analysis 로직을 직접 포함
  const [gameStatus, setGameStatus] = useState<'waiting' | 'analyzing' | 'finished' | 'fail'>('waiting');
  const [, setColorResult] = useState<ColorResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<string>("");
  // const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 제시어 오버레이 상태
  const [showKeyword, setShowKeyword] = useState(false);
  const [keywordVisible, setKeywordVisible] = useState(false);
  const [isPromptShownOnce, setIsPromptShownOnce] = useState(false);
  
  // 랜덤 색상 선택
  const [currentColor] = useState(() => {
    if (keywords && keywords.r !== undefined && keywords.g !== undefined && keywords.b !== undefined) {
      return { r: Number(keywords.r), g: Number(keywords.g), b: Number(keywords.b), name: "제시된 색상" };
    }
    return colorPrompts[Math.floor(Math.random() * colorPrompts.length)];
  });



  // 게임 시작 시 제시어 표시
  useEffect(() => {
    if (isGameActive && !isPromptShownOnce) {
      setShowKeyword(true);
      setTimeout(() => setKeywordVisible(true), 100);
      setTimeout(() => {
        setKeywordVisible(false);
        setTimeout(() => {
          setShowKeyword(false);
          setIsPromptShownOnce(true);
          setGameStatus('waiting'); // 제시어 표시 후 대기 상태로 변경
        }, 300);
      }, 2000);
    }
  }, [isGameActive, isPromptShownOnce]);

  // 색상 분석
  const analyzeColor = useCallback(async () => {
    if (!isGameActive || !videoRef?.current || videoRef.current.readyState < 2 || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setGameStatus('analyzing');
    
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
          setGameStatus('finished');
          setIsAnalyzing(false);
          return;
        }
      
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // FormData로 이미지 데이터 준비
      const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else throw new Error('이미지 Blob을 생성할 수 없습니다.');
        }, 'image/jpeg', 0.8);
      });
      
      const { userData } = useUserLoginStore.getState();
      const res = await judgeGame({
        roomId: roomId || 0,
        roundIdx: roundIdx || 1,
        gameCode: 3,
        userId: userData?.memberUid || 0,
        request: {
          image: imageBlob,
          r: currentColor.r,
          g: currentColor.g,
          b: currentColor.b
        }
      });
      const result = res.data;
      
      console.log('🎨 ColorIt AI 분석 결과:', result);
      
             if (result.colorScore !== undefined) {
         const newColorResult: ColorResult = {
           closest_color: result.closest_color || `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`,
           similarity: result.colorScore
         };
         
         setColorResult(newColorResult);
         
         // similarity_score가 이미 백분율로 나오므로 그대로 사용
         const similarityPercent = Math.round(result.colorScore);
         
         setAiResults(`색상 유사도: ${similarityPercent}%`);
         
         // 유사도 순으로 랭킹이 결정되므로 항상 true로 처리
         setTimeout(() => {
           onGameComplete?.(true, [], similarityPercent);
           setGameStatus('finished');
         }, 2000);
       }
    } catch (error) {
      console.error('AI 색상 분석 오류:', error);
      setAiResults('색상 분석에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
      if (gameStatus !== 'finished') {
        setGameStatus('waiting');
      }
    }
  }, [isGameActive, videoRef, currentColor, isAnalyzing, onGameComplete, gameStatus]);

  // 키보드 이벤트 처리 (스페이스바로 캡처)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isGameActive && gameStatus === 'waiting' && !isAnalyzing) {
        event.preventDefault();
        void analyzeColor();
      }
    };

    if (isGameActive) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isGameActive, gameStatus, isAnalyzing, analyzeColor]);

  // 게임 타이머 포맷팅
  const formatGameTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  return (
    <motion.div
      className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/10 via-white/50 to-green-100/10 -z-10" />
      
      {/* 헤더: 게임 설명 */}
      <header className="flex flex-col bg-white/50 backdrop-blur-sm border-b border-green-200">
        <div className="flex items-center justify-between p-4">
          <motion.button 
            onClick={onGameEnd}
            className="p-2 rounded-lg bg-green-200 hover:bg-green-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6 text-green-600" />
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-green-800 tracking-wider">
              ColorIt
            </h1>
          </div>
        
          <div className="flex items-center gap-2 text-green-700">
            <span className="text-lg">⏰</span>
            <motion.span 
              className="font-mono font-bold text-green-700"
            >
              {formatGameTime(timeLeft)}
            </motion.span>
          </div>
        </div>

      </header>

      {/* 중앙: 참가자들과 내 화면 */}
      <div className="flex-1 flex flex-col">
        {/* 참가자 영상 스크롤 영역 */}
        <div className="bg-white/50 backdrop-blur-sm border-b border-green-200 p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-bold text-base sm:text-lg lg:text-xl text-green-700 tracking-wider">
              참가자들 ({participants.length + 1}명)
            </h3>
          </div>

          <div className="flex gap-3 sm:gap-4 lg:gap-6 justify-center">
            {participants.length > 0 ? (
              participants.slice(0, 5).map((participant, index) => (
                <motion.div
                  key={participant.identity || index}
                  className="relative w-36 h-28 sm:w-44 sm:h-32 lg:w-52 lg:h-40 xl:w-56 xl:h-44 bg-white/80 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-green-300"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <ParticipantTile participant={participant} livekitParticipant={participant} />
                  </div>
                  
                  {/* 참가자 이름 오버레이 */}
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
                    <div className="bg-slate-700/70 backdrop-blur-sm rounded px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 pointer-events-none">
                      <span className="text-white text-xs sm:text-sm lg:text-sm font-bold truncate block text-center">
                        {participant.name || participant.identity}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="w-full h-28 sm:h-32 lg:h-40 xl:h-44 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <span className="text-green-500 text-sm sm:text-base lg:text-lg">다른 참가자를 기다리는 중...</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 내 화면 영역 (Zoom처럼 크게) */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
          <motion.div 
            className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl border-4 border-green-400"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* 내 화면 컨트롤 오버레이 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <motion.button
                onClick={onToggleVideo}
                className="p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg bg-green-500/80 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Video className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={onToggleAudio}
                className="p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg bg-green-500/80 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Mic className="w-5 h-5" />
              </motion.button>
            </div>

            {/* 내 화면 라벨 */}
            <div className="absolute top-4 left-4">
              <div className="bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white text-sm font-bold">
                  나의 색상
                </span>
              </div>
            </div>

            {/* 오버레이: AI 분석 중 표시 */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-green-900/90 backdrop-blur-sm z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center text-white">
                    <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="text-xl mb-2">AI 분석 중</h3>
                    <p className="text-green-200">색상을 분석하고 있습니다...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 게임 결과 오버레이 */}
            <AnimatePresence>
              {(gameStatus === 'finished' || gameStatus === 'fail') && !isAnalyzing && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  >
                    <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl border-4 border-green-500">
                      <h2 className="text-3xl font-bold mb-4 text-green-600">
                        🎨 색상 완성!
                      </h2>
                      <p className="text-lg text-gray-700 mb-2">{aiResults}</p>
                      <p className="text-sm text-gray-500">
                        다른 참가자들을 기다리고 있습니다...
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 제시어 오버레이 */}
            <AnimatePresence>
              {showKeyword && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="text-center"
                    initial={{ y: -100, opacity: 0, scale: 0.8 }}
                    animate={{
                      y: keywordVisible ? 0 : -100,
                      opacity: keywordVisible ? 1 : 0,
                      scale: keywordVisible ? 1 : 0.8
                    }}
                    transition={{ type: "spring", damping: 20, stiffness: 300, duration: 0.6 }}
                  >
                    <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl">
                      <p className="text-green-600 text-base mb-2">찾을 색상</p>
                      <div className="flex items-center justify-center mb-4">
                        <div 
                          className="w-24 h-24 rounded-full border-4 border-green-300 shadow-lg"
                          style={{ backgroundColor: rgbToHex(currentColor.r, currentColor.g, currentColor.b) }}
                        ></div>
                      </div>
                      <h1 className="text-4xl md:text-6xl text-green-800">
                        {currentColor.name}
                      </h1>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* 하단: 사진찍기 버튼 (모바일/태블릿용) */}
      {isPortrait && (
        <div className="p-4 flex flex-col items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border-2 border-green-300">
            <p className="text-sm text-gray-700 mb-1 text-center">
              제시어: <span className="font-medium text-green-600">{currentColor.name}</span>
            </p>
            <p className="text-xs text-gray-600 text-center">
              색상이 비슷한 물건을 보여주세요!
            </p>
          </div>
          
          <motion.button
            onClick={analyzeColor}
            className={`px-8 py-4 rounded-full shadow-lg flex items-center gap-3 ${
              gameStatus === 'finished' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
            whileHover={gameStatus !== 'finished' ? { scale: 1.05 } : {}}
            whileTap={gameStatus !== 'finished' ? { scale: 0.95 } : {}}
            disabled={isAnalyzing || gameStatus === 'finished'}
          >
            <Camera className="w-6 h-6" />
            <span className="text-lg font-bold">
              {isAnalyzing ? '분석 중...' : gameStatus === 'finished' ? '완료!' : '색상 캡처하기'}
            </span>
          </motion.button>
        </div>
      )}

      {/* 데스크톱용 안내 */}
      {!isPortrait && (
        <div className="p-4 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-green-300">
            <p className="text-sm text-gray-700 mb-1">
              제시어: <span className="font-medium text-green-600">{currentColor.name}</span>
            </p>
            <p className="text-sm text-gray-600">
              색상이 비슷한 물건을 보여주고 스페이스바를 눌러 캡처하세요!
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
