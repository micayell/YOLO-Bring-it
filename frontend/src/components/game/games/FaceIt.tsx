import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";

import { Camera, Mic, Video, X } from "lucide-react";
import { useIsPortrait } from "@/shared/ui/use-window-size";

interface EmotionResult {
  emotion: string;
  confidence: number;
}

interface FaceItProps {
  targetEmotion?: string;
  timeLeft: number;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isGameActive?: boolean;
  onGameComplete?: (success: boolean) => void;
  onGameEnd?: () => void;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  participants?: any[];
}

const emotionPrompts = [
  "행복",
  "슬픔", 
  "화남",
  "놀람",
  "무서움",
  "역겨움",
  "무표정"
];

// 감정과 이모지 매핑
const emotionEmojis: Record<string, string> = {
  "행복": "😊",
  "슬픔": "😢", 
  "화남": "😠",
  "놀람": "😲",
  "무서움": "😨",
  "역겨움": "🤢",
  "무표정": "😐"
};

export const FaceIt: React.FC<FaceItProps> = ({
  targetEmotion,
  timeLeft,
  videoRef,
  isGameActive = true,
  onGameComplete,
  onGameEnd,
  // isVideoEnabled = true,
  // isAudioEnabled = true,
  onToggleVideo,
  onToggleAudio,
  participants = []
}) => {
  const isPortrait = useIsPortrait();
  
  // AI Emotion Recognition 로직을 직접 포함
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gameResult, setGameResult] = useState<'pending' | 'analyzing' | 'waiting' | 'pass' | 'fail' | 'timeout'>('pending');
  const [, setEmotionResult] = useState<EmotionResult | null>(null);
  const [aiResults, setAiResults] = useState<string>("");
  const [, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 제시어 오버레이 상태
  const [showKeyword, setShowKeyword] = useState(false);
  const [keywordVisible, setKeywordVisible] = useState(false);
  const [isPromptShownOnce, setIsPromptShownOnce] = useState(false);
  
  // 랜덤 감정 선택
  const [currentEmotion] = useState<string>(() => {
    return targetEmotion || emotionPrompts[Math.floor(Math.random() * emotionPrompts.length)];
  });

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
          setGameResult('waiting'); // 제시어 표시 후 대기 상태로 변경
        }, 300);
      }, 2000);
    }
  }, [isGameActive, isPromptShownOnce]);

  // 감정 분석
  const analyzeEmotion = useCallback(async () => {
    if (!videoRef?.current || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setError(null);
      setGameResult('analyzing');

      // 비디오 프레임 캡처
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas context를 가져올 수 없습니다.');
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      // Blob으로 변환
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('이미지를 Blob으로 변환할 수 없습니다.'));
          }
        }, 'image/jpeg', 0.8);
      });

      // FormData로 전송
      const formData = new FormData();
      formData.append('file', blob, 'emotion.jpg');

      // API 호출
      const response = await fetch('http://i13C207.p.ssafy.io:8001/api/analyze-emotion-nobg', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('😊 AI 감정 분석 결과:', result);
      
      if (result.success === false) {
        throw new Error(result.message || '감정 분석에 실패했습니다.');
      }
      
      if (result.dominant_emotion && result.emotion_scores) {
        // 가장 높은 점수의 감정 찾기
        const dominantEmotion = result.dominant_emotion;
        const emotionScores = result.emotion_scores;
        const scores = Object.values(emotionScores) as number[];
        const maxScore = Math.max(...scores);
        
        const emotion = {
          emotion: dominantEmotion,
          confidence: maxScore / 100 // 백분율을 0-1 범위로 변환
        };
        
        setEmotionResult(emotion);
        
        // 타겟 감정과 일치하는지 확인 (한국어 감정명 매핑)
        const emotionMapping: Record<string, string[]> = {
          "행복": ["happy", "joy", "행복", "기쁨"],
          "슬픔": ["sad", "sadness", "슬픔", "우울"],
          "화남": ["angry", "anger", "화남", "분노"],
          "놀람": ["surprise", "surprised", "놀람", "놀라움"],
          "무서움": ["fear", "scared", "무서움", "두려움"],
          "역겨움": ["disgust", "disgusted", "역겨움", "혐오"],
          "무표정": ["neutral", "무표정", "중립"]
        };
        
        const targetEmotions = emotionMapping[currentEmotion] || [currentEmotion];
        const isCorrect = targetEmotions.some((target: string) => 
          dominantEmotion.toLowerCase().includes(target.toLowerCase())
        );
        const score = Math.floor(maxScore);
        
        // AI 분석 완료 후 대기 상태로 변경
        setGameResult('waiting');
        setAiResults(`감정을 완성했습니다! (정확도: ${score}%)`);
        
        setTimeout(() => {
          onGameComplete?.(isCorrect);
        }, 2000);
      } else {
        throw new Error('감정 분석 결과가 없습니다.');
      }
    } catch (error) {
      console.error('AI 감정 분석 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      setGameResult('fail');
      setTimeout(() => {
        onGameComplete?.(false);
      }, 3000);
    } finally {
      setIsAnalyzing(false);
    }
  }, [videoRef, targetEmotion, isAnalyzing, onGameComplete, currentEmotion]);

  // 키보드 이벤트 처리 (스페이스바로 캡처)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isGameActive && gameResult === 'waiting' && !isAnalyzing) {
        event.preventDefault();
        analyzeEmotion();
      }
    };

    if (isGameActive) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isGameActive, gameResult, isAnalyzing, analyzeEmotion]);

  // 게임 타이머 포맷팅
  const formatGameTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="h-screen flex flex-col bg-gradient-to-br from-red-50 to-red-100 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-100/10 via-white/50 to-red-100/10 -z-10" />
      
      {/* 헤더: 게임 설명 */}
      <header className="flex flex-col bg-white/50 backdrop-blur-sm border-b border-red-200">
        <div className="flex items-center justify-between p-4">
          <motion.button 
            onClick={onGameEnd}
            className="p-2 rounded-lg bg-red-200 hover:bg-red-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6 text-red-600" />
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-red-800 tracking-wider">
              FaceIt
            </h1>
          </div>
        
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-lg">⏰</span>
            <motion.span 
              className="font-mono font-bold text-red-700"
            >
              {formatGameTime(timeLeft)}
            </motion.span>
          </div>
        </div>
      </header>

      {/* 중앙: 참가자들과 내 화면 */}
      <div className="flex-1 flex flex-col">
        {/* 참가자 영상 스크롤 영역 */}
        <div className="bg-white/50 backdrop-blur-sm border-b border-red-200 p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-bold text-base sm:text-lg lg:text-xl text-red-700 tracking-wider">
              참가자들 ({participants.length + 1}명)
            </h3>
          </div>

          <div className="flex gap-3 sm:gap-4 lg:gap-6 justify-center">
            {participants.length > 0 ? (
              participants.slice(0, 5).map((participant, index) => (
                <motion.div
                  key={participant.identity || index}
                  className="relative w-36 h-28 sm:w-44 sm:h-32 lg:w-52 lg:h-40 xl:w-56 xl:h-44 bg-white/80 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-red-300"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-full h-full bg-red-200 flex items-center justify-center">
                    <span className="text-red-500 text-sm">{participant.identity}</span>
                  </div>
                  
                  {/* 참가자 이름 오버레이 */}
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
                    <div className="bg-red-500/90 backdrop-blur-sm rounded px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1">
                      <span className="text-white text-xs sm:text-sm lg:text-sm font-bold truncate block text-center">
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
                  <span className="text-red-500 text-sm sm:text-base lg:text-lg">다른 참가자를 기다리는 중...</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 내 화면 영역 (Zoom처럼 크게) */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
          <motion.div 
            className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl border-4 border-red-400"
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
                className="p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg bg-red-500/80 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Video className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={onToggleAudio}
                className="p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg bg-red-500/80 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Mic className="w-5 h-5" />
              </motion.button>
            </div>

            {/* 내 화면 라벨 */}
            <div className="absolute top-4 left-4">
              <div className="bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white text-sm font-bold">
                  나의 표정
                </span>
              </div>
            </div>

            {/* 오버레이: AI 분석 중 표시 */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-red-900/90 backdrop-blur-sm z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center text-white">
                    <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="text-xl mb-2">AI 분석 중</h3>
                    <p className="text-red-200">감정을 분석하고 있습니다...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 게임 결과 오버레이 */}
            <AnimatePresence>
              {gameResult === 'waiting' && !isAnalyzing && aiResults && (
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
                    <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl border-4 border-red-500">
                      <h2 className="text-3xl font-bold mb-4 text-red-600">
                        😊 감정 완성!
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
                      <p className="text-red-600 text-base mb-2">표현할 감정</p>
                      <div className="text-6xl md:text-8xl mb-4">
                        {emotionEmojis[currentEmotion]}
                      </div>
                      <h1 className="text-4xl md:text-6xl text-red-800">
                        {currentEmotion}
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
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border-2 border-red-300">
            <p className="text-sm text-gray-700 mb-1 text-center">
              제시어: <span className="font-medium text-red-600">{currentEmotion}</span>
            </p>
            <p className="text-xs text-gray-600 text-center">
              표정을 지은 후 버튼을 클릭하세요!
            </p>
          </div>
          
          <motion.button
            onClick={analyzeEmotion}
            className={`px-8 py-4 rounded-full shadow-lg flex items-center gap-3 ${
              gameResult === 'pass' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600'
            } text-white`}
            whileHover={gameResult !== 'pass' ? { scale: 1.05 } : {}}
            whileTap={gameResult !== 'pass' ? { scale: 0.95 } : {}}
            disabled={isAnalyzing || gameResult === 'pass'}
          >
            <Camera className="w-6 h-6" />
            <span className="text-lg font-bold">
              {isAnalyzing ? '분석 중...' : gameResult === 'pass' ? '성공!' : '표정 캡처하기'}
            </span>
          </motion.button>
        </div>
      )}

      {/* 데스크톱용 안내 */}
      {!isPortrait && (
        <div className="p-4 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-red-300">
            <p className="text-sm text-gray-700 mb-1">
              제시어: <span className="font-medium text-red-600">{currentEmotion}</span>
            </p>
            <p className="text-sm text-gray-600">
              표정을 지은 후 스페이스바를 눌러 캡처하고 AI 분석을 시작하세요!
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
