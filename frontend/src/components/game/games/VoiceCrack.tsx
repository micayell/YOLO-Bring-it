import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Video, X, Play, Square } from "lucide-react";
import { useIsPortrait } from "@/shared/ui/use-window-size";
import { useLocalWebRTC } from "@/shared/hooks/useLocalWebRTC";

interface VoiceCrackProps {
  famousLine?: string;
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

interface AudioResult {
  target_text: string;
  user_text: string;
  text_score_percent: number;
  audio_score_percent: number;
  overall_score_percent: number;
}

const famousLines = [
  "그렇게 다 가져가야만 속이 후련했냐!"
];

export function VoiceCrack({
  famousLine = "그렇게 다 가져가야만 속이 후련했냐!",
  timeLeft,
  videoRef: externalVideoRef,
  isGameActive = true,
  onGameComplete,
  onGameEnd,
  // isVideoEnabled: externalIsVideoEnabled = true,
  // isAudioEnabled: externalIsAudioEnabled = true,
  onToggleVideo: externalOnToggleVideo,
  onToggleAudio: externalOnToggleAudio,
  participants = []
}: VoiceCrackProps) {
  const isPortrait = useIsPortrait();
  
  // 로컬 WebRTC 훅 사용
  const {
    videoRef: localVideoRef,
    // isVideoEnabled: localIsVideoEnabled,
    // isAudioEnabled: localIsAudioEnabled,
    // isConnecting,
    error: webRTCError,
    toggleVideo: localToggleVideo,
    toggleAudio: localToggleAudio,
  } = useLocalWebRTC();

  // 외부에서 전달받은 props가 있으면 사용, 없으면 로컬 값 사용
  const videoRef = externalVideoRef || localVideoRef;
  // const isVideoEnabled = externalIsVideoEnabled ?? localIsVideoEnabled;
  // const isAudioEnabled = externalIsAudioEnabled ?? localIsAudioEnabled;
  const onToggleVideo = externalOnToggleVideo || localToggleVideo;
  const onToggleAudio = externalOnToggleAudio || localToggleAudio;
  
  // 음성 녹음 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [targetDuration, setTargetDuration] = useState(0); // 제시 음성 길이에 따라 동적 설정
  const [, setUserFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioResult, setAudioResult] = useState<AudioResult | null>(null);
  const [aiResults, setAiResults] = useState<string>("");
  const [audioError, setAudioError] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'countdown' | 'recording' | 'analyzing' | 'finished'>('waiting');
  
  // 제시 음성 관련 상태
  // const [, setShowKeyword] = useState(false);
  // const [, setKeywordVisible] = useState(false);
  const [isPromptShownOnce, setIsPromptShownOnce] = useState(false);
  const [isPlayingTargetAudio, setIsPlayingTargetAudio] = useState(false);
  const [targetAudioDuration, setTargetAudioDuration] = useState(0);
  
  // 제시 음성 오디오 요소
  // const targetAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // 랜덤 명대사 선택
  const [currentFamousLine] = useState(() => {
    return famousLine || famousLines[Math.floor(Math.random() * famousLines.length)];
  });

  // 녹음 관련 refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 게임 타이머
  useEffect(() => {
    if (isGameActive && timeLeft > 0) {
      const timer = setInterval(() => {
        if (timeLeft <= 1) {
          if (gameStatus !== 'finished') {
            onGameComplete?.(false);
            setGameStatus('finished');
          }
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isGameActive, timeLeft, onGameComplete, gameStatus]);

  // 게임 시작 시 제시 음성 재생
  useEffect(() => {
    if (isGameActive && !isPromptShownOnce) {
      // 제시 음성 재생 시작
      setGameStatus('playing');
      setIsPlayingTargetAudio(true);
      
      // 제시 음성 재생 (실제로는 API에서 가져온 음성 파일)
      playTargetAudio();
    }
  }, [isGameActive, isPromptShownOnce]);

  // 제시 음성 파일 가져오기
  const getTargetAudioFile = useCallback(async (): Promise<File | null> => {
    try {
      // 실제로는 API에서 제시 음성 파일을 가져와야 함
      // 현재는 임시로 빈 파일 반환 (실제 구현에서는 API 호출)
      const targetBlob = new Blob([''], { type: 'audio/mp3' });
      const targetFile = new File([targetBlob], `${currentFamousLine}_target.mp3`, { type: 'audio/mp3' });
      
      console.log('🎵 제시 음성 파일 준비:', targetFile.name);
      return targetFile;
    } catch (error) {
      console.error('❌ 제시 음성 파일 가져오기 실패:', error);
      return null;
    }
  }, [currentFamousLine]);

  // 제시 음성 재생 함수
  const playTargetAudio = useCallback(async () => {
    // 제시 음성 파일 가져오기
    // const targetFile = await getTargetAudioFile();
    
    // 임시로 3초 길이의 제시 음성으로 설정
    const duration = 3; // 실제로는 제시 음성 파일의 길이
    setTargetAudioDuration(duration);
    setTargetDuration(duration);
    
    // 제시 음성 재생 시뮬레이션
    setTimeout(() => {
      setIsPlayingTargetAudio(false);
      setGameStatus('countdown');
      // 3초 카운트다운 후 녹음 시작
      setCountdown(3);
    }, duration * 1000);
  }, [getTargetAudioFile]);

  // 녹음 시작 (카운트다운 후 자동 시작 - 강제 동기화)
  const startRecording = useCallback(async () => {
    if (isRecording || isAnalyzing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/mp3') ? 'audio/mp3' : 'audio/webm';
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const ext = mimeType.includes('mp3') ? '.mp3' : '.webm';
        const file = new File([blob], `voice_recording${ext}`, { type: mimeType });
        setUserFile(file);
        setIsRecording(false);
        setRemainingTime(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        // 녹음 완료 후 자동으로 분석 시작
        analyzeAudio(file);
      };

      // 강제로 녹음 시작 (사용자 선택 불가)
      setIsRecording(true);
      setGameStatus('recording');
      console.log('🎤 강제 녹음 시작!');
    } catch (err) {
      setAudioError("마이크 접근 권한이 필요합니다.");
      console.error(err);
    }
  }, [isRecording, isAnalyzing]);

  // 카운트다운 처리
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && gameStatus === 'countdown' && !isRecording) {
      // 카운트다운 완료 후 녹음 시작
      startRecording();
    }
  }, [countdown, gameStatus, isRecording, startRecording]);

  // 녹음 타이머 처리 (강제 동기화)
  useEffect(() => {
    if (isRecording && targetDuration > 0) {
      setRemainingTime(targetDuration);
      
      // MediaRecorder 시작
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
        mediaRecorderRef.current.start();
        console.log('🎙️ MediaRecorder 시작됨');
      }
      
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop();
              console.log('⏹️ 강제 녹음 종료!');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 제시 음성 길이만큼 정확히 녹음 (강제 종료)
      const recordingTimeout = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          console.log('⏹️ 시간 초과로 강제 녹음 종료!');
        }
      }, targetDuration * 1000);

      return () => {
        clearTimeout(recordingTimeout);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isRecording, targetDuration]);

  // 음성 분석
  const analyzeAudio = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setGameStatus('analyzing');
    setAudioError(null);

    try {
      // 실제 AI API 호출
      const formData = new FormData();
      
      // 제시 음성 파일 가져오기
      const targetFile = await getTargetAudioFile();
      if (!targetFile) {
        throw new Error('제시 음성 파일을 가져올 수 없습니다.');
      }
      
      formData.append("target_file", targetFile);
      formData.append("user_file", file);

      console.log('🎤 AI API 호출 시작...');
      console.log('📁 제시 파일:', targetFile.name);
      console.log('📁 사용자 파일:', file.name);
      
      const response = await fetch('http://i13C207.p.ssafy.io:8001/api/audio-similarity?language=ko-KR', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ AI 분석 결과:', result);

      // AI 결과에 error가 있으면 에러로 처리
      if (result.error || !result.overall_score_percent) {
        throw new Error(result.error || 'AI 분석 결과가 올바르지 않습니다.');
      }

      const audioResult: AudioResult = {
        target_text: result.target_text || currentFamousLine,
        user_text: result.user_text || "음성 인식 완료",
        text_score_percent: result.text_score_percent || Math.floor(Math.random() * 40) + 60, // 60-100%
        audio_score_percent: result.audio_score_percent || Math.floor(Math.random() * 40) + 60, // 60-100%
        overall_score_percent: result.overall_score_percent || Math.floor(Math.random() * 40) + 60 // 60-100%
      };

      setAudioResult(audioResult);
      setAiResults(`음성 유사도: ${audioResult.overall_score_percent}%`);
      
      // 3초 후 게임 완료
      setTimeout(() => {
        onGameComplete?.(true);
        setGameStatus('finished');
        setIsPromptShownOnce(true);
      }, 3000);

    } catch (error) {
      console.error('❌ 음성 분석 오류:', error);
      setAudioError('음성 분석에 실패했습니다.');
      
      // 에러 시에도 게임 완료 처리
      setTimeout(() => {
        onGameComplete?.(false);
        setGameStatus('finished');
        setIsPromptShownOnce(true);
      }, 3000);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentFamousLine, onGameComplete, getTargetAudioFile]);

  // 키보드 이벤트 처리 (스페이스바로 게임 재시작 - 테스트용)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isGameActive && gameStatus === 'waiting' && !isRecording && !isAnalyzing) {
        event.preventDefault();
        // 게임 재시작 (테스트용)
        setIsPromptShownOnce(false);
        setGameStatus('playing');
        setIsPlayingTargetAudio(true);
        playTargetAudio();
      }
    };

    if (isGameActive) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isGameActive, gameStatus, isRecording, isAnalyzing, playTargetAudio]);

  // 게임 타이머 포맷팅
  const formatGameTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 via-white/50 to-blue-100/10 -z-10" />
      
      {/* 헤더: 게임 설명 */}
      <header className="flex flex-col bg-white/50 backdrop-blur-sm border-b border-blue-200">
        <div className="flex items-center justify-between p-4">
          <motion.button 
            onClick={onGameEnd}
            className="p-2 rounded-lg bg-blue-200 hover:bg-blue-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6 text-blue-600" />
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-blue-800 tracking-wider">
              VoiceCrack
            </h1>
          </div>
        
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-lg">⏰</span>
            <motion.span 
              className="font-mono font-bold text-blue-700"
            >
              {formatGameTime(timeLeft)}
            </motion.span>
          </div>
        </div>


      </header>

      {/* 중앙: 참가자들과 내 화면 */}
      <div className="flex-1 flex flex-col">
        {/* 참가자 영상 스크롤 영역 */}
        <div className="bg-white/50 backdrop-blur-sm border-b border-blue-200 p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-bold text-base sm:text-lg lg:text-xl text-blue-700 tracking-wider">
              참가자들 ({participants.length + 1}명)
            </h3>
          </div>

          <div className="flex gap-3 sm:gap-4 lg:gap-6 justify-center">
            {participants.length > 0 ? (
              participants.slice(0, 5).map((participant, index) => (
                <motion.div
                  key={participant.identity || index}
                  className="relative w-36 h-28 sm:w-44 sm:h-32 lg:w-52 lg:h-40 xl:w-56 xl:h-44 bg-white/80 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-blue-300"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                    <span className="text-blue-500 text-sm">{participant.identity}</span>
                  </div>
                  
                  {/* 참가자 이름 오버레이 */}
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
                    <div className="bg-blue-500/90 backdrop-blur-sm rounded px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1">
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
                  <span className="text-blue-500 text-sm sm:text-base lg:text-lg">다른 참가자를 기다리는 중...</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 내 화면 영역 */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
          <motion.div 
            className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl border-4 border-blue-400"
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
            {!videoRef?.current && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>카메라 로딩 중...</p>
                </div>
              </div>
            )}
            
            {/* 내 화면 컨트롤 오버레이 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <motion.button
                onClick={onToggleVideo}
                className="p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg bg-blue-500/80 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Video className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={onToggleAudio}
                className="p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg bg-blue-500/80 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Mic className="w-5 h-5" />
              </motion.button>
            </div>

            {/* 내 화면 라벨 */}
            <div className="absolute top-4 left-4">
              <div className="bg-blue-500/90 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white text-sm font-bold">
                  나의 음성
                </span>
              </div>
            </div>

            {/* 카운트다운 오버레이 */}
            <AnimatePresence>
              {countdown > 0 && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-blue-900/90 backdrop-blur-sm z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center text-white">
                    <h3 className="text-6xl font-bold mb-4">{countdown}</h3>
                    <p className="text-xl">준비...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 녹음 중 오버레이 */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-red-900/90 backdrop-blur-sm z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center text-white">
                    <div className="animate-pulse w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Mic className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl mb-2">녹음 중...</h3>
                    <p className="text-red-200">남은 시간: {remainingTime}초</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI 분석 중 오버레이 */}
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
                    <p className="text-blue-200">음성을 분석하고 있습니다...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

                         {/* 게임 결과 오버레이 */}
             <AnimatePresence>
               {gameStatus === 'finished' && !isAnalyzing && aiResults && (
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
                     <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl border-4 border-blue-500">
                       <h2 className="text-3xl font-bold mb-4 text-blue-600">
                         🎭 음성 분석 완료!
                       </h2>
                       <p className="text-lg text-gray-700 mb-2">{aiResults}</p>
                       {audioResult && (
                         <div className="text-sm text-gray-600 space-y-1">
                           <p>텍스트 유사도: {audioResult.text_score_percent}%</p>
                           <p>음성 유사도: {audioResult.audio_score_percent}%</p>
                         </div>
                       )}
                       <p className="text-sm text-gray-500 mt-2">
                         3초 후 라운드 결과로 이동합니다...
                       </p>
                     </div>
                   </motion.div>
                 </motion.div>
               )}
             </AnimatePresence>

            {/* 제시 음성 재생 오버레이 */}
            <AnimatePresence>
              {isPlayingTargetAudio && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-purple-900/90 backdrop-blur-sm z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="text-center"
                    initial={{ y: -100, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300, duration: 0.6 }}
                  >
                    <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl">
                      <div className="animate-pulse w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <p className="text-purple-600 text-base mb-2">명대사 재생 중</p>
                      <h1 className="text-3xl md:text-5xl text-purple-800 mb-4">
                        "{currentFamousLine}"
                      </h1>
                      <p className="text-lg text-gray-600">잘 들어보세요!</p>
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                          className="bg-purple-500 h-2 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: targetAudioDuration, ease: "linear" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 카운트다운 오버레이 */}
            <AnimatePresence>
              {countdown > 0 && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-orange-900/90 backdrop-blur-sm z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center text-white">
                    <h3 className="text-6xl font-bold mb-4">{countdown}</h3>
                    <p className="text-xl">준비...</p>
                    <p className="text-orange-200 mt-2">곧 녹음이 시작됩니다!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* 하단: 게임 안내 (모바일/태블릿용) */}
      {isPortrait && (
        <div className="p-4 flex flex-col items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border-2 border-blue-300">
            <p className="text-sm text-gray-700 mb-1 text-center">
              명대사: <span className="font-medium text-blue-600">"{currentFamousLine}"</span>
            </p>
            <p className="text-xs text-gray-600 text-center">
              제시된 음성을 따라해주세요!
            </p>
          </div>
          
          <motion.button
            onClick={() => {
              setIsPromptShownOnce(false);
              setGameStatus('playing');
              setIsPlayingTargetAudio(true);
              playTargetAudio();
            }}
            className={`px-8 py-4 rounded-full shadow-lg flex items-center gap-3 ${
              gameStatus === 'playing' || isRecording || isAnalyzing
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            whileHover={gameStatus !== 'playing' && !isRecording && !isAnalyzing ? { scale: 1.05 } : {}}
            whileTap={gameStatus !== 'playing' && !isRecording && !isAnalyzing ? { scale: 0.95 } : {}}
            disabled={gameStatus === 'playing' || isRecording || isAnalyzing}
          >
            {gameStatus === 'playing' ? (
              <>
                <Play className="w-6 h-6" />
                <span className="text-lg font-bold">음성 재생 중...</span>
              </>
            ) : isRecording ? (
              <>
                <Square className="w-6 h-6" />
                <span className="text-lg font-bold">녹음 중...</span>
              </>
            ) : isAnalyzing ? (
              <>
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                <span className="text-lg font-bold">분석 중...</span>
              </>
            ) : gameStatus === 'finished' ? (
              <>
                <span className="text-lg font-bold">완료!</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                <span className="text-lg font-bold">게임 시작</span>
              </>
            )}
          </motion.button>
        </div>
      )}

             {/* 데스크톱용 안내 */}
       {!isPortrait && (
         <div className="p-4 text-center">
           <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-blue-300">
             <p className="text-sm text-gray-700 mb-1">
               명대사: <span className="font-medium text-blue-600">"{currentFamousLine}"</span>
             </p>
             <p className="text-sm text-gray-600">
               제시된 음성을 따라해주세요! 녹음은 자동으로 시작됩니다.
             </p>
             <p className="text-xs text-gray-500 mt-1">
               (테스트용: 스페이스바로 게임 재시작)
             </p>
           </div>
         </div>
       )}

      {/* 에러 표시 */}
      {(audioError || webRTCError) && (
        <motion.div 
          className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-lg border border-red-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-300" />
            <span className="font-medium">{audioError || webRTCError}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
