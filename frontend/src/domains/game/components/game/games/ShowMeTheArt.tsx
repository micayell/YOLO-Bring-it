import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Palette, RotateCcw, Brush, Users, Camera } from "lucide-react";
import { useIsPortrait } from "@/shared/ui/use-window-size";

interface ShowMeTheArtProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isGameActive: boolean;
  onGameComplete: (success: boolean) => void;
  onGameEnd?: () => void;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  participants?: any[];
}

const drawingPrompts = [
  "강아지를 그려보세요!",
  "나비를 그려보세요!",
  "사람을 그려보세요!",
  "꽃을 그려보세요!",
  "달팽이를 그려보세요!"
];

// CLIP API 라벨과 한국어 제시어 매핑
const labelTranslations: Record<string, string> = {
  "a photo of a dog": "강아지",
  "a photo of a butterfly": "나비",
  "a photo of a person": "사람",
  "a photo of a flower": "꽃",
  "a photo of a snail": "달팽이"
};

export const ShowMeTheArt: React.FC<ShowMeTheArtProps> = ({
  videoRef,
  isGameActive,
  onGameComplete,
  // onGameEnd,
  // isVideoEnabled = true,
  // isAudioEnabled = true,
  // onToggleVideo,
  // onToggleAudio,
  participants = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameResult, setGameResult] = useState<'pending' | 'waiting' | 'complete'>('pending');
  const [aiResults, setAiResults] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [, setCapturedImage] = useState<string>("");

  const colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  const isPortrait = useIsPortrait();

  // ----- 리사이즈에 맞춰 캔버스 픽셀 크기 동기화 (선명도 개선) -----
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement; // absolute inset-4 박스
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      // devicePixelRatio 반영해도 좋지만 여기선 간단히 1배율
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
      // 배경 흰색으로 초기화
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    // 최초 1회 + 리사이즈 반영
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // 게임 초기화
  useEffect(() => {
    if (isGameActive) {
      initializeGame();
    }
  }, [isGameActive]);

  const initializeGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    // 랜덤 제시어 선택
    const randomPrompt = drawingPrompts[Math.floor(Math.random() * drawingPrompts.length)];
    setCurrentPrompt(randomPrompt);

    setTimeout(() => {
      setShowPrompt(true);
      setTimeout(() => setPromptVisible(true), 100);
      setTimeout(() => {
        setPromptVisible(false);
        setTimeout(() => {
          setShowPrompt(false);
          setGameStarted(true);
        }, 300);
      }, 2000);
    }, 1000);
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    if (!gameStarted || isSubmitting) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
    draw(e);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !gameStarted || isSubmitting) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentColor;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const captureDrawing = async () => {
    if (!gameStarted || isSubmitting || isCapturing) return;
    setIsCapturing(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 캔버스를 Blob으로 변환
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // 캡처된 이미지를 base64로 저장(디버그/리뷰용)
        const reader = new FileReader();
        reader.onload = () => setCapturedImage(reader.result as string);
        reader.readAsDataURL(blob);

        const formData = new FormData();
        formData.append('file', blob, 'drawing.png');
        formData.append('text', currentPrompt);

        const response = await fetch('http://i13c207.p.ssafy.io:8001/api/clip-multi-similarity', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('🎨 AI 분석 결과:', result);

          if (result.scores && result.best_match && result.best_score_percent) {
            // 제시어에서 키워드 추출 (조사 제거)
            const targetKeywords = currentPrompt.replace(/[을를이에의]/g, '').trim();

            // CLIP API 결과와 매칭 확인
            const expectedLabel = Object.keys(labelTranslations).find(
              label => labelTranslations[label] === targetKeywords
            );

            // 유사도 점수 계산
            const score = Math.floor(result.best_score_percent);
            const isCorrect = expectedLabel === result.best_match;

            setGameResult('waiting');
            setAiResults(`그림을 완성했습니다! (유사도: ${score}%)`);

            setTimeout(() => {
              onGameComplete(isCorrect);
            }, 2000);
          } else {
            setGameResult('waiting');
            setAiResults('그림을 완성했습니다!');
            setTimeout(() => onGameComplete(true), 2000);
          }
        } else {
          throw new Error(`API 호출 실패: ${response.status}`);
        }
      }, 'image/png');
    } catch (error) {
      console.error('AI 분석 오류:', error);
      setGameResult('waiting');
      setAiResults('그림을 완성했습니다!');
      setTimeout(() => onGameComplete(true), 2000);
    } finally {
      setIsCapturing(false);
    }
  };

  const submitDrawing = async () => {
    if (!gameStarted || isSubmitting) return;
    setIsSubmitting(true);
    await captureDrawing();
    setIsSubmitting(false);
  };

  // 스페이스바로 캡처
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameStarted && !isSubmitting && !isCapturing) {
        e.preventDefault();
        captureDrawing();
      }
    };

    if (isGameActive) document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, isSubmitting, isCapturing, isGameActive]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* 헤더 */}
      <header className="flex flex-col bg-white/50 backdrop-blur-sm border-b border-green-200">
        <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-orange-800">ShowMeTheArt</h2>
              <p className="text-sm text-orange-600">주제에 맞는 그림을 그려보세요!</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-800">그림 그리기</div>
              <div className="text-sm text-orange-600">AI가 평가합니다</div>
            </div>
          </div>
        </div>
      </header>

      {/* 참가자 섹션 */}
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
                <div className="w-full h-full bg-green-200 flex items-center justify-center">
                  <span className="text-green-500 text-sm">{participant.identity}</span>
                </div>
                <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
                  <div className="bg-green-500/90 backdrop-blur-sm rounded px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1">
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
                <span className="text-green-500 text-sm sm:text-base lg:text-lg">
                  다른 참가자를 기다리는 중...
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 메인 그리기 영역: 높이 보장 + absolute 배치 */}
      <div className="relative w-full h-[560px] md:h-[640px]">
        {/* 비디오 배경 */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        {/* 그리기 캔버스 */}
        <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            // width/height는 리사이즈 이펙트에서 동기화함(여기 값은 초기값)
            width={1200}
            height={720}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />
        </div>

        {/* 제시어 오버레이 */}
        <AnimatePresence>
          {showPrompt && (
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
                  y: promptVisible ? 0 : -100,
                  opacity: promptVisible ? 1 : 0,
                  scale: promptVisible ? 1 : 0.8
                }}
                transition={{ type: "spring", damping: 20, stiffness: 300, duration: 0.6 }}
              >
                <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl">
                  <p className="text-orange-600 text-base mb-2">그림 주제</p>
                  <h1 className="text-4xl md:text-6xl text-orange-800">
                    {currentPrompt}
                  </h1>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI 분석 오버레이 */}
        <AnimatePresence>
          {(isSubmitting || isCapturing) && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-orange-900/90 backdrop-blur-sm z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center text-white">
                <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl mb-2">AI 평가 중</h3>
                <p className="text-orange-200">그림을 분석하고 있습니다...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 게임 결과 오버레이 */}
        <AnimatePresence>
          {gameResult === 'waiting' && !isSubmitting && !isCapturing && (
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
                <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl border-4 border-orange-500">
                  <h2 className="text-3xl font-bold mb-4 text-orange-600">
                    🎨 그림 완성!
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

        {/* 현재 사용자 라벨 */}
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <Brush className="w-4 h-4" />
            나의 그림
          </div>
        </div>

        {/* 다른 플레이어 라벨 */}
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            {participants.length}명 참여 중
          </div>
        </div>
      </div>

      {/* 하단 컨트롤 */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-orange-200 p-4">
        {/* 그리기 도구 */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-orange-600" />
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    currentColor === color ? 'border-orange-500 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-orange-600 text-sm">브러시 크기:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-orange-500 text-sm">{brushSize}px</span>
          </div>

          <Button
            onClick={clearCanvas}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            지우기
          </Button>
        </div>

        {/* 캡처 버튼 */}
        {gameStarted && (
          <div className="flex justify-center">
            <Button
              onClick={captureDrawing}
              disabled={isSubmitting || isCapturing}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg rounded-xl shadow-lg"
            >
              <Camera className="w-6 h-6 mr-2" />
              {isCapturing ? '캡처 중...' : '그림 캡처하기'}
            </Button>
          </div>
        )}

        {/* 제출 버튼 (태블릿/모바일에서만 표시) */}
        {gameStarted && isPortrait && (
          <div className="flex justify-center mt-2">
            <Button
              onClick={submitDrawing}
              disabled={isSubmitting || isCapturing}
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50 px-6 py-2 text-base rounded-lg"
            >
              <Brush className="w-5 h-5 mr-2" />
              그림 제출하기
            </Button>
          </div>
        )}

        {/* 팁 */}
        <div className="mt-4 text-center">
          <p className="text-orange-600 text-sm">
            {isPortrait
              ? '💡 그림을 그린 후 캡처 버튼을 눌러 AI 분석을 시작하세요!'
              : '💡 스페이스바를 눌러서 빠르게 캡처하세요! AI가 그림을 분석하여 주제와의 일치도를 평가합니다!'}
          </p>
        </div>
      </div>
    </div>
  );
};
