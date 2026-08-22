
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface BlinkBattleProps {
  blinkCount?: number;
  remainingTime: number;
  timeLimit?: number;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isGameActive?: boolean;
  onGameComplete?: (success: boolean) => void;
}

export function BlinkBattle({
  blinkCount = 0,
  // remainingTime,
  // timeLimit = 60,
  videoRef,
  isGameActive = true,
  onGameComplete
}: BlinkBattleProps) {
  // AI Eye Blink Detection 로직을 직접 포함
  const [isConnected, setIsConnected] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [detectedBlinkCount, setDetectedBlinkCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("AI 연결 대기 중...");
  const socketRef = useRef<Socket | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const targetBlinkCount = 5; // 목표 깜빡임 횟수
  const currentBlinkCount = detectedBlinkCount || blinkCount;

  // WebSocket 연결 및 이벤트 핸들러 설정
  useEffect(() => {
    if (!isGameActive) {
      // 게임 비활성 시 연결 정리
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        console.log('👁️ AI 눈 감지 서버 연결 해제됨 (게임 비활성)');
      }
      return;
    }

    const newSocket = io("http://i13c207.p.ssafy.io:8001", { // 원격 AI 서버 연결
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('👁️ AI 눈 감지 서버 연결됨');
      setIsConnected(true);
      setStatusMessage("얼굴을 인식시켜주세요...");
    });

    newSocket.on('disconnect', () => {
      console.log('👁️ AI 눈 감지 서버 연결 해제됨');
      setIsConnected(false);
      setStatusMessage("AI 서버와 연결이 끊겼습니다.");
    });

    newSocket.on('face_result', (data) => {
      // 이미 탈락했거나 게임이 끝났으면 더 이상 처리하지 않음
      if (isEliminated || !isGameActive) return;

      if (data.error) {
        setStatusMessage("얼굴 미감지");
      } else {
        setStatusMessage(data.closed ? "눈 감음!" : "눈 뜸");
        if (data.closed) {
          console.log("탈락: 눈을 감았습니다.");
          setIsEliminated(true);
          onGameComplete?.(false); // 게임 실패로 즉시 완료 처리
        }
      }
    });
    
    newSocket.on('eye_event', (data) => {
       if (data.status === "closed") {
           setDetectedBlinkCount(prev => prev + 1);
       }
    });

    return () => {
      if (newSocket) {
        newSocket.close();
        console.log('👁️ AI 눈 감지 서버 연결 해제됨 (컴포넌트 정리)');
      }
    };
  }, [isGameActive, isEliminated, onGameComplete]);

  // 비디오 프레임 전송 로직
  useEffect(() => {
    if (!isGameActive || !isConnected || isEliminated || !videoRef?.current) {
      if(frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      return;
    }

    const videoElement = videoRef.current;

    frameIntervalRef.current = setInterval(() => {
      // videoElement와 context가 유효한지 매번 확인
      if (videoElement && videoElement.readyState >= 2) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('frame', { frame });
        }
      }
    }, 100); // 10fps

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, [isGameActive, isConnected, isEliminated, videoRef]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border-2 border-[#ffd93d]/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">👁️</span>
        <span className="font-['BM_HANNA_TTF:Regular',_sans-serif] text-base">BlinkBattle</span>
      </div>
      <div className="text-center">
        <div className="bg-yellow-100 rounded-lg p-2 mb-1">
          <p className="font-bold text-yellow-600 text-base">눈을 깜빡여주세요!</p>
        </div>
        
        {/* 깜빡임 카운터 */}
        <div className="text-2xl font-bold text-yellow-600 mb-2">
          {currentBlinkCount} / {targetBlinkCount}
        </div>
        
        <p className="text-xs text-gray-600">카메라를 정면으로 바라보세요</p>
        
        {/* 연결 상태 */}
        {!isConnected && (
          <div className="text-red-600 text-xs mt-1">AI 서버 연결 중...</div>
        )}
        
        {isConnected && (
          <div className="text-green-600 text-xs mt-1">AI 연결됨</div>
        )}
        
        {/* 상태 메시지 */}
        <div className="text-xs text-gray-500 mt-1">
          {statusMessage}
        </div>
        
        {/* 탈락 상태 */}
        {isEliminated && (
          <div className="text-red-600 text-xs mt-1 font-bold">탈락!</div>
        )}
        
        {/* 성공 상태 */}
        {currentBlinkCount >= targetBlinkCount && (
          <div className="text-green-600 text-xs mt-1 font-bold">성공!</div>
        )}
        
        {/* 진행률 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((currentBlinkCount / targetBlinkCount) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
