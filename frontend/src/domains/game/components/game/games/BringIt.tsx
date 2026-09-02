import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Camera, Mic, Video, X } from "lucide-react";
import { useIsPortrait } from "@/shared/ui/use-window-size";
// 💥 useGameWebSocket import 제거
import { judgeGame } from "@/domains/game/services/gameService";
import { useUserLoginStore } from "@/domains/user/stores/userStore";

interface DetectedObject {
  label: string;
  confidence: number;
}

interface BringItProps {
  targetObject?: string;
  timeLeft: number;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isGameActive?: boolean;
  onGameComplete?: (success: boolean, aiResults?: DetectedObject[], score?: number) => void;
  onGameEnd?: () => void;
  // 비디오 관련 props
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  // 참가자 관련 props
  participants?: any[];
  // 웹소켓 관련 props
  roomId?: number;
  roundIdx?: number;
  gameCode?: string;
}

export function BringIt({
  targetObject = "핸드폰",
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
}: BringItProps) {
  const isPortrait = useIsPortrait();
  
  // AI Object Detection 로직을 직접 포함
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gameResult, setGameResult] = useState<'waiting' | 'analyzing' | 'pass' | 'fail' | 'timeout'>('waiting');
  const [, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 💥 웹소켓 연결 로직 제거

  // 제시어 오버레이 상태
  const [showKeyword, setShowKeyword] = useState(false);
  const [keywordVisible, setKeywordVisible] = useState(false);

  // 게임 타이머
  useEffect(() => {
    if (isGameActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        if (timeLeft <= 1) {
          setGameResult('timeout');
          onGameComplete?.(false);
          return;
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isGameActive, timeLeft, onGameComplete]);

  // 프레임 분석
  const analyzeFrame = useCallback(async () => {
    if (!videoRef?.current || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setError(null);
      setGameResult('analyzing');

      // 비디오 프레임 캡처
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
          setError('Canvas context를 가져올 수 없습니다.');
          setGameResult('fail');
          setIsAnalyzing(false);
          return;
        }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      // Blob으로 변환 (ObjectDetectForm.js와 동일한 방식)
      const imageBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) {
              resolve(b);
          } else {
            reject(new Error('이미지를 Blob으로 변환할 수 없습니다.'));
          }
        }, 'image/jpeg', 0.8);
      });

      // FormData 생성 (ObjectDetectForm.js와 동일한 방식)
      const { userData } = useUserLoginStore.getState();
      const res = await judgeGame({
        roomId: roomId || 0,
        roundIdx: roundIdx || 1,
        gameCode: 1,
        userId: userData?.memberUid || 0,
        request: {
          targetItem: targetObject,
          image: imageBlob
        }
      });
      
      const targetDetected = res.data?.result === 'PASS';
      
      if (targetDetected) {
          setGameResult('pass');
          const score = Math.floor((timeLeft / 60) * 100); // 남은 시간에 비례한 점수
          onGameComplete?.(true, [], score); // 💥 성공 시 점수와 함께 onGameComplete 호출
        } else {
          setGameResult('fail');
          // fail일 때는 onGameComplete를 호출하지 않음 (계속 시도 가능)
        }
      } catch (error) {
      console.error('AI 분석 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      setGameResult('fail');
    } finally {
      setIsAnalyzing(false);
    }
  }, [videoRef, targetObject, isAnalyzing, onGameComplete, timeLeft]);

  // 스페이스바 키 이벤트 (데스크톱)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isGameActive && !isPortrait && gameResult !== 'pass') {
        event.preventDefault();
        void analyzeFrame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGameActive, isPortrait, gameResult, analyzeFrame]);

  // 자동 분석 비활성화 (수동으로만 캡처)
  // useEffect(() => {
  //   if (isGameActive && gameResult === 'waiting') {
  //     const analysisInterval = setInterval(analyzeFrame, 5000);
  //     return () => clearInterval(analysisInterval);
  //   }
  // }, [isGameActive, gameResult, analyzeFrame]);

  // 게임 시작 시 제시어 오버레이 표시
  useEffect(() => {
    if (isGameActive && gameResult === 'waiting') {
      // 제시어 오버레이 표시
      setTimeout(() => {
        setShowKeyword(true);
        setTimeout(() => setKeywordVisible(true), 100);
        setTimeout(() => {
          setKeywordVisible(false);
          setTimeout(() => {
            setShowKeyword(false);
          }, 300);
        }, 2500);
      }, 1000);
    }
  }, [isGameActive, gameResult]);

  // 💥 게임 종료 시 웹소켓 전송 로직 제거

  const formatGameTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="h-screen flex flex-col bg-[#F0F8FF] font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6dc4e8]/10 via-white/50 to-[#6dc4e8]/10 -z-10" />
      
      {/* 헤더: 게임 설명 */}
      <header className="flex flex-col bg-white/50 backdrop-blur-sm border-b border-[#6dc4e8]/20">
        <div className="flex items-center justify-between p-4">
          <motion.button 
            onClick={onGameEnd}
            className="p-2 rounded-lg bg-[#6dc4e8]/20 hover:bg-[#6dc4e8]/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6 text-[#6dc4e8]" />
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-xl font-['BM_HANNA_TTF:Regular',_sans-serif] text-black tracking-wider">
              BringIt
            </h1>
          </div>
        
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-lg">⏰</span>
            <motion.span 
              className="font-mono font-bold text-slate-700"
            >
              {formatGameTime(timeLeft)}
            </motion.span>
            {/* 웹소켓 연결 상태 표시 */}
            {/* <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                 title={isConnected ? '웹소켓 연결됨' : '웹소켓 연결 안됨'} /> */ }
          </div>
        </div>
      </header>

      {/* 중앙: 참가자들과 내 화면 */}
      <div className="flex-1 flex flex-col">
        {/* 참가자 영상 스크롤 영역 */}
        <div className="bg-white/50 backdrop-blur-sm border-b border-[#6dc4e8]/20 p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-base sm:text-lg lg:text-xl text-slate-700 tracking-wider">
              참가자들 ({participants.length + 1}명)
            </h3>
          </div>

          <div className="flex gap-3 sm:gap-4 lg:gap-6 justify-center">
            {participants.length > 0 ? (
              participants.slice(0, 5).map((participant, index) => (
                <motion.div
                  key={participant.identity || index}
                  className="relative w-36 h-28 sm:w-44 sm:h-32 lg:w-52 lg:h-40 xl:w-56 xl:h-44 bg-white/80 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-[#6dc4e8]/30"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">{participant.identity}</span>
                  </div>
                  
                  {/* 참가자 이름 오버레이 */}
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
                    <div className="bg-[#6dc4e8]/90 backdrop-blur-sm rounded px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1">
                      <span className="text-white text-xs sm:text-sm lg:text-sm font-['BM_HANNA_TTF:Regular',_sans-serif] truncate block text-center">
                        {participant.identity}
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
                  <span className="text-slate-500 text-sm sm:text-base lg:text-lg">다른 참가자를 기다리는 중...</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 내 화면 영역 (Zoom처럼 크게) */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
          <motion.div 
            className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl border-4 border-[#10b981]/30"
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
                className="p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg bg-[#6dc4e8]/80 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Video className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={onToggleAudio}
                className="p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg bg-[#6dc4e8]/80 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Mic className="w-5 h-5" />
              </motion.button>
            </div>

            {/* 내 화면 라벨 */}
            <div className="absolute top-4 left-4">
              <div className="bg-[#6dc4e8]/90 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white text-sm font-['BM_HANNA_TTF:Regular',_sans-serif]">
                  내 화면
                </span>
              </div>
            </div>



            {/* 오버레이: AI 분석 중 표시 */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-blue-900/90 backdrop-blur-sm z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center text-white">
                    <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="text-xl mb-2">AI 분석 중</h3>
                    <p className="text-blue-200">사진을 분석하고 있습니다...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 오버레이: 게임 완료 표시 */}
            <AnimatePresence>
              {gameResult === 'pass' && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-green-900/90 backdrop-blur-sm z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center text-white max-w-md">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl mb-2">성공!</h3>
                    <p className="text-lg mb-2">{targetObject}을 찾았습니다!</p>
                    <p className="text-sm mb-6 opacity-80">
                      AI가 정확히 인식했습니다!
                    </p>
                  </div>
                </motion.div>
              )}

              {gameResult === 'fail' && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-red-900/90 backdrop-blur-sm z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center text-white max-w-md">
                    <div className="text-6xl mb-4">😅</div>
                    <h3 className="text-2xl mb-2">아쉬워요!</h3>
                    <p className="text-lg mb-2">{targetObject}을 찾지 못했습니다.</p>
                    <p className="text-sm mb-6 opacity-80">
                      다시 시도해보세요!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI 분석 결과 표시 */}
            

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
                     transition={{ 
                       type: "spring",
                       damping: 20,
                       stiffness: 300,
                       duration: 0.6
                     }}
                   >
                     <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl">
                       <p className="text-blue-600 text-base mb-2">제시어</p>
                       <h1 className="text-4xl text-blue-800">
                         {targetObject}
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
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border-2 border-[#10b981]/30">
            <p className="text-sm text-gray-700 mb-1 text-center">
              제시어: <span className="font-medium text-blue-600">{targetObject}</span>
            </p>
            <p className="text-xs text-gray-600 text-center">
              물건을 카메라에 보여주고 버튼을 클릭하세요!
            </p>
          </div>
          
          <motion.button
            onClick={analyzeFrame}
            className={`px-8 py-4 rounded-full shadow-lg flex items-center gap-3 ${
              gameResult === 'pass' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#10b981] hover:bg-[#059669]'
            } text-white`}
            whileHover={gameResult !== 'pass' ? { scale: 1.05 } : {}}
            whileTap={gameResult !== 'pass' ? { scale: 0.95 } : {}}
            disabled={isAnalyzing || gameResult === 'pass'}
          >
            <Camera className="w-6 h-6" />
            <span className="text-lg font-bold">
              {isAnalyzing ? '분석 중...' : gameResult === 'pass' ? '성공!' : '사진 찍기'}
            </span>
          </motion.button>
        </div>
      )}

      {/* 데스크톱용 안내 */}
      {!isPortrait && (
        <div className="p-4 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-[#10b981]/30">
            <p className="text-sm text-gray-700 mb-1">
              제시어: <span className="font-medium text-blue-600">{targetObject}</span>
            </p>
            <p className="text-sm text-gray-600">
              물건을 카메라에 보여주고 스페이스바를 눌러 사진을 찍고 AI 분석을 시작하세요!
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
