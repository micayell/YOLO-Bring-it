import { useState, useEffect, useRef } from "react";

import type { GameData, RoundResult, GameType } from "@/shared/types/game";
import { useIsPortrait } from "@/shared/ui/use-window-size";
// import { ChatPanel, ChatSidePanel, MobileSheet } from "@/widgets/ChatComponents";
import { useLiveKitStore } from "@/app/stores/livekitStore";
import { livekitService } from "@/shared/services/livekitService";
import { Room, DisconnectReason, ConnectionState, LocalParticipant, ParticipantEvent, Track, TrackPublication, RemoteParticipant } from 'livekit-client';
// import { ParticipantTile } from "@/widgets/ParticipantTile";
import { useGameWebSocket } from "@/shared/hooks/useGameWebSocket";
import { useAuthStore } from "@/app/stores/authStore";
// import { gameTypeToCode } from "@/shared/hooks/useGameLogic";
import apiClient from "@/shared/services/api";
import { toast } from "sonner";
// 분리된 컴포넌트들
import { GameCountdownScreen, GameHeader } from "@/components/game";
import { TheFastestFinger } from "@/components/game/games/TheFastestFinger";
import { BringIt } from "@/components/game/games/BringIt";

// 테스트용: TheFastestFinger 게임 강제 실행 모드
const IS_TEST_MODE_FASTEST_FINGER = false;

interface GameScreenProps {
  gameData: GameData;
  roomId: number;
  onRoundComplete: (result: RoundResult) => void;
  onGameEnd: () => void;
}

export function GameScreen({
  gameData,
  roomId,
  onRoundComplete,
  onGameEnd,
}: GameScreenProps) {
  const [gamePhase, setGamePhase] = useState<"loading" | "countdown" | "playing" | "complete">("loading");
  const [countdown, setCountdown] = useState<number>(3);
  const [gameTime, setGameTime] = useState<number>(0); // 게임 진행 시간
  const [isGameTimerRunning, setIsGameTimerRunning] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const isPortrait = useIsPortrait();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiResults] = useState<any[]>([]); // AI 분석 결과 저장 (TheFastestFinger에선 미사용)
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number | null>(null);
  const [currentGameInfo, setCurrentGameInfo] = useState<any | null>(null);

  // 인증 정보 가져오기
  const { user } = useAuthStore();
  
  // LiveKit 스토어
  const {
    room,
    participants: livekitParticipants,
    isConnecting: isLivekitConnecting,
    isConnected: isLivekitConnected,
    error: livekitError,
    livekitUrl,
    setRoom,
    addParticipant,
    removeParticipant,
    setConnecting,
    setConnected,
    setError,
    reset: resetLivekit
  } = useLiveKitStore();
  
  // StrictMode 중복 실행 방지용 Ref
  const effectRan = useRef(false);

  // 인게임 웹소켓 연결
  const {
    isConnected: isWebSocketConnected,
    sendGameStart,
    sendGameScore,
    // sendGameEnd
  } = useGameWebSocket({
    roomId: roomId,
    onRoundIntro: (data) => {
      console.log('🎮 ROUND_INTRO 수신:', data);
      setGamePhase("loading"); // 라운드 정보 로딩 시작
      setCurrentRoundIdx(data.roundIdx);
    },
    onRoundEnd: (data) => {
      console.log('🏁 ROUND_ENDED 수신:', data);
      setGamePhase("complete");
      // 서버에서 받은 순위 정보로 결과 생성
      if (data.leaderboard) {
        const result: RoundResult = {
          round: data.roundIdx,
          gameType: gameData.gameType, // 현재 게임 데이터에서 가져옴
          rankings: data.leaderboard.map((r: any) => ({
            playerId: r.memberId.toString(),
            rank: r.rank,
            score: r.totalScore,
            performance: "" // 필요 시 추가 정보
          }))
        };
        onRoundComplete(result);
      }
    },
    onGameScore: (data) => {
      console.log('📊 점수 업데이트 수신:', data);
    },
    onError: (error) => {
      console.error('❌ 웹소켓 에러:', error);
    }
  });

  // LiveKit 연결 함수
  const connectToLiveKit = async () => {
    console.log('🎥 LiveKit 연결 시작...', { roomId, livekitUrl });
    setConnecting(true);
    setError(null);

    try {
      const token = await livekitService.getLiveKitToken(roomId.toString());
      console.log('✅ LiveKit 토큰 획득:', token.substring(0, 20) + '...');

      const livekitRoom = new Room({
        // dynacast: 동적 캐스팅을 활성화하여 네트워크 상태에 따라 최적의 비디오 품질을 제공합니다.
        // 이를 통해 연결 안정성을 높이고 여러 서버 지역 간의 자동 전환을 개선할 수 있습니다.
        dynacast: true,
      });
      
      // 이벤트 리스너 등록
      livekitRoom.on('participantConnected', (participant: any) => {
        console.log('👋 참가자 연결:', participant.identity);
        addParticipant(participant);
      });

      livekitRoom.on('participantDisconnected', (participant: any) => {
        console.log('👋 참가자 연결 해제:', participant.identity);
        removeParticipant(participant);
      });

      livekitRoom.on('disconnected', (reason?: DisconnectReason) => {
        console.log('🔌 LiveKit 연결 해제:', reason);
        setConnected(false);
        setConnecting(false);
      });

      // ✅ 연결 상태 변경 이벤트 리스너 추가
      livekitRoom.on('connectionStateChanged', async (state) => {
        console.log('🔄 LiveKit 연결 상태 변경:', state);
        if (state === ConnectionState.Connected) {
          console.log('✅ LiveKit 미디어 엔진 연결 완료');
          // 로컬 참가자의 카메라와 마이크를 활성화하여 비디오/오디오 송출 시작
          await livekitRoom.localParticipant.setCameraEnabled(true);
          await livekitRoom.localParticipant.setMicrophoneEnabled(true);
          console.log('📹 로컬 카메라 및 마이크 발행 시작');
        }
      });

      // 연결
      await livekitRoom.connect(livekitUrl, token);
      console.log('✅ LiveKit 인증 성공, 미디어 엔진 연결 대기 중...');
      
      setRoom(livekitRoom);
      setConnected(true);
      setConnecting(false);
    } catch (error) {
      console.error('❌ LiveKit 연결 실패:', error);
      setError('LiveKit 연결에 실패했습니다.');
      setConnecting(false);
    }
  };

  // 연결 해제 함수
  const disconnectFromLiveKit = () => {
    console.log('🚪 LiveKit 연결 해제...');
    if (room) {
      room.disconnect();
    }
    resetLivekit();
  };

  // 참가자 목록 결정: LiveKit 연결 시, 원격 + 로컬 참가자를 모두 포함
  const participants = isLivekitConnected && room
    ? [room.localParticipant, ...Array.from(livekitParticipants.values())].map(p => ({
        identity: p.identity,
        sid: p.sid,
        isLocal: p instanceof LocalParticipant,
        isConnected: true,
        hasVideo: p.isCameraEnabled,
        hasAudio: p.isMicrophoneEnabled,
      }))
    : mockParticipants.map(p => ({ ...p, sid: p.identity, isLocal: false }));


  // 참가자들 스크롤 상태 - 반응형 대응
  const [participantScrollIndex, setParticipantScrollIndex] = useState(0);
  
  // 화면 크기에 따른 최대 표시 참가자 수
  const getMaxVisibleParticipants = () => {
    if (typeof window === 'undefined') return 5;
    const width = window.innerWidth;
    if (width < 768) return 2; // 모바일: 2명
    if (width < 1024) return 3; // 태블릿: 3명  
    if (width < 1280) return 4; // 작은 데스크톱: 4명
    return 5; // 큰 데스크톱: 5명
  };
  
  const [maxVisibleParticipants, setMaxVisibleParticipants] = useState(getMaxVisibleParticipants());
  
  const [message, setMessage] = useState("");
  const [messages] = useState<any[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(true); // 채팅 패널 토글 상태
  const handleSendMessage = () => {};
  const handleKeyPress = () => {};

  // TheFastestFinger 테스트 전용 상태
  // const [isButtonVisible, setIsButtonVisible] = useState<boolean>(false);
  // const [reactionTime, setReactionTime] = useState<number>(0);
  const buttonTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonAppearAtRef = useRef<number | null>(null);

  // 라운드 정보 API 호출
  useEffect(() => {
    const fetchRoundInfo = async () => {
      if (currentRoundIdx === null || !user?.id) return;

      try {
        console.log(`📡 라운드 정보 API 호출: /in-game-rounds/${roomId}/${currentRoundIdx}`);
        const response = await apiClient.get(`/games/in-game-rounds/${roomId}/${currentRoundIdx}`, {
          headers: {
            'X-MEMBER-UID': user.id,
          }
        });

        if(response.data.data) {
          console.log('✅ 라운드 정보 수신:', response.data.data);
          setCurrentGameInfo(response.data.data);
          setGameTime(response.data.data.timeLimit || 60);
          setGamePhase("countdown");
          setCountdown(3);
        } else {
          throw new Error("유효하지 않은 라운드 정보 형식");
        }
      } catch (error) {
        console.error('❌ 라운드 정보 불러오기 실패:', error);
        toast.error('이번 라운드 정보를 불러오는 데 실패했습니다.');
        // 에러 발생 시 게임을 멈추거나, 다음 라운드로 넘기는 등의 처리가 필요할 수 있음
      }
    };

    fetchRoundInfo();
  }, [currentRoundIdx, roomId, user?.id]);


  // 새로운 게임 설정 사용 (API에서 받아온 정보 사용)
  const currentGameConfig = currentGameInfo;

  // 게임 타이머 포맷팅 함수
  const formatGameTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 남은 시간 계산
  const remainingTime = currentGameConfig?.timeLimit - gameTime || 0;
  const isTimeRunningOut = remainingTime <= 10; // 10초 이하일 때 경고



  // 게임 시작 시 LiveKit 연결
  useEffect(() => {
    // StrictMode에서 두 번째 실행되는 것을 방지합니다.
    if (effectRan.current === true) {
      return;
    }

    console.log('🎮 GameScreen useEffect 실행:', { roomId, isLivekitConnecting, isLivekitConnected });
    
    if (roomId) {
      console.log('🎮 게임 시작: LiveKit 연결 시작');
      connectToLiveKit();
    } else {
      console.log('❌ roomId가 없어서 LiveKit 연결 시도 안함');
    }

    // 이 effect가 실행되었다고 표시
    effectRan.current = true;

    return () => {
      console.log('🚪 게임 종료: LiveKit 연결 해제');
      disconnectFromLiveKit();
      // 컴포넌트 언마운트 시 초기화 - StrictMode 이중 호출 방지를 위해 이 부분은 비활성화
      // effectRan.current = false;
    };
  }, [roomId]); // roomId가 변경될 때만 재연결

  // LiveKit 로컬 참가자 상태 추적 (가장 안정적인 버전)
  useEffect(() => {
    const participant = room?.localParticipant;
    if (!participant) return;

    const onTrackMuted = (pub: TrackPublication) => {
      if (pub.kind === Track.Kind.Video) setIsVideoEnabled(false);
      if (pub.kind === Track.Kind.Audio) setIsAudioEnabled(false);
    };
    const onTrackUnmuted = (pub: TrackPublication) => {
      if (pub.kind === Track.Kind.Video) setIsVideoEnabled(true);
      if (pub.kind === Track.Kind.Audio) setIsAudioEnabled(true);
    };

    // 초기 상태 설정
    setIsVideoEnabled(participant.isCameraEnabled);
    setIsAudioEnabled(participant.isMicrophoneEnabled);

    // 이벤트 리스너 등록
    participant.on(ParticipantEvent.TrackMuted, onTrackMuted);
    participant.on(ParticipantEvent.TrackUnmuted, onTrackUnmuted);

    return () => {
      // 컴포넌트 언마운트 시 리스너 해제
      participant.off(ParticipantEvent.TrackMuted, onTrackMuted);
      participant.off(ParticipantEvent.TrackUnmuted, onTrackUnmuted);
    };
  }, [room?.localParticipant]);


  // 라운드 시작 카운트다운 로직 (3, 2, 1)
  useEffect(() => {
    if (gamePhase !== "countdown") return;

    console.log('🔢 카운트다운 진행 중:', countdown);

    if (countdown > 0) {
      const timer = setTimeout(() => {
        const nextCount = countdown - 1;
        console.log('⏰ 다음 카운트다운:', nextCount);
        setCountdown(nextCount);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // 0에서 0.5초 후 게임 시작
      console.log('🚀 카운트다운 완료! 게임 시작...');
      const timer = setTimeout(() => {
        setGamePhase("playing");
        setIsGameTimerRunning(true);
        setGameTime(0);
        console.log('✅ 게임 페이즈를 playing으로 변경');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [countdown, gamePhase]);

  // 게임 타이머 로직
  useEffect(() => {
    // 테스트 모드에서는 GameScreen의 자체 타이머를 비활성화합니다.
    if (!isGameTimerRunning || !currentGameConfig) return;

    const timer = setInterval(() => {
      setGameTime(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsGameTimerRunning(false);
          setGamePhase("complete");
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameTimerRunning, currentGameConfig]);

  // 라운드 변경 감지 - 이 로직은 onRoundIntro 핸들러로 대체됨
  // useEffect(() => {
  //   console.log('🔄 라운드 변경 감지:', gameData.currentRound);
  //   setGamePhase("countdown");
  //   setCountdown(3);
  //   setGameTime(0);
  //   setIsGameTimerRunning(false);
  //   console.log('🔄 새 라운드 카운트다운 시작: 3');
  // }, [gameData.currentRound]); // currentRound가 변경될 때마다 카운트다운 다시 시작

  // 반응형 대응: 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setMaxVisibleParticipants(getMaxVisibleParticipants());
      // 현재 스크롤 인덱스가 새로운 최대값보다 크면 조정
      setParticipantScrollIndex(prev => {
        const newMax = getMaxVisibleParticipants();
        return Math.min(prev, Math.max(0, participants.length - newMax));
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [participants.length]);

  // 참가자 스크롤 컨트롤
  const scrollLeft = () => {
    setParticipantScrollIndex(Math.max(0, participantScrollIndex - 1));
  };

  const scrollRight = () => {
    const maxIndex = Math.max(0, participants.length - maxVisibleParticipants);
    setParticipantScrollIndex(Math.min(maxIndex, participantScrollIndex + 1));
  };

  const visibleParticipants = participants.slice(
    participantScrollIndex,
    participantScrollIndex + maxVisibleParticipants
  );

  // AI 훅들은 각 게임 컴포넌트 내부로 이동됨
  // 더 이상 여기서 AI 훅을 사용하지 않음

  // 게임 활성 상태
  // const isGameActive = gamePhase === "playing"; // (TheFastestFinger 단독 테스트에서는 미사용)

  // TheFastestFinger: playing 시작 시 랜덤 딜레이 후 버튼 표시
  useEffect(() => {
    if (gamePhase !== "playing") {
      // 정리
      if (buttonTimeoutRef.current) {
        clearTimeout(buttonTimeoutRef.current);
        buttonTimeoutRef.current = null;
      }
      // setIsButtonVisible(false);
      buttonAppearAtRef.current = null;
      return;
    }

    // 라운드 시작 시 반응 버튼 스케줄링
    // setReactionTime(0);
    // setIsButtonVisible(false);
    buttonAppearAtRef.current = null;

    const delayMs = 1000 + Math.floor(Math.random() * 3000); // 1~4초 사이
    buttonTimeoutRef.current = setTimeout(() => {
      buttonAppearAtRef.current = performance.now();
      // setIsButtonVisible(true);
    }, delayMs);

    return () => {
      if (buttonTimeoutRef.current) {
        clearTimeout(buttonTimeoutRef.current);
        buttonTimeoutRef.current = null;
      }
    };
  }, [gamePhase]);

  // const handleFastestButtonClick = useCallback(() => {
  //   if (!isButtonVisible || !buttonAppearAtRef.current) return;
  //   const now = performance.now();
  //   const rtSec = (now - buttonAppearAtRef.current) / 1000;
  //   setReactionTime(rtSec);
  //   setIsButtonVisible(false);

  //   // 결과 표시를 위해 잠시 대기 후 종료
  //   setTimeout(() => {
  //     setIsGameTimerRunning(false);
  //     setGamePhase("complete");
  //   }, 1500);
  // }, [isButtonVisible]);

  // 게임 시작 시 웹소켓으로 시작 신호 전송 -> 이 로직은 더 이상 필요 없음 (API 호출로 대체)
  // useEffect(() => {
  //   if (gamePhase === "playing" && isWebSocketConnected) {
  //     sendGameStart(gameData.gameType);
  //     console.log('🎮 게임 시작 신호 전송:', gameData.gameType);
  //   }
  // }, [gamePhase, isWebSocketConnected, sendGameStart, gameData.gameType]);

  // 게임 완료 시 결과 데이터 생성 및 전달 (hooks 규칙 준수를 위해 최상위로 이동)
  useEffect(() => {
    // 테스트 모드가 아닐 때만 이 로직을 사용
    if (gamePhase === "complete") {
      // GameScreen에서는 더 이상 직접 결과를 생성하지 않음.
      // 각 게임 컴포넌트가 onGameComplete를 통해 결과를 전달하면,
      // onRoundEnd 핸들러가 서버의 leaderboard로 최종 결과를 처리함.
      console.log('게임 페이즈 complete, onRoundEnd 대기중...');
    }
  }, [gamePhase]);

  // 현재 게임에 맞는 컴포넌트를 렌더링하는 함수
  const renderCurrentGame = () => {
    // onGameComplete 핸들러를 정의
    const handleGameComplete = (success: boolean, aiResults?: any[], score?: number) => {
      console.log('✅ 게임 완료:', { success, score });
      if (success && score && isWebSocketConnected && currentGameInfo) {
        console.log(`🚀 점수 전송: ${score}점`);
        sendGameScore(currentGameInfo.gameCode, score);
      }
      // 게임 완료 후에는 onRoundEnd 웹소켓 메시지를 기다리므로,
      // 여기서는 즉시 onRoundComplete를 호출하지 않음.
      setGamePhase("complete");
    };

  // 테스트용: 모든 게임을 TheFastestFinger로 강제 변경
    if (IS_TEST_MODE_FASTEST_FINGER) {
    return (
      <TheFastestFinger
        localParticipant={room?.localParticipant}
        remoteParticipants={Array.from(livekitParticipants.values())}
        onRoundComplete={(data) => {
          const roundResult = {
            round: 1,
            gameType: 'quick_press' as const,
            rankings: data.playerResults.map((pr, index) => ({
              playerId: pr.id.toString(),
              score: pr.reactionTime || 0,
              rank: index + 1,
              performance: pr.reactionTime ? `${pr.reactionTime}초` : 'N/A'
            }))
          };
          onRoundComplete(roundResult);
        }}
      />
    );
  }

    // 실제 게임 타입에 따라 분기
    switch (currentGameInfo?.gameCode) {
      case 'bring_object': // TODO: gameCode를 숫자로 받을지 문자열로 받을지 백엔드와 협의 필요
        return (
          <BringIt
            timeLeft={gameTime}
            onGameComplete={handleGameComplete}
          />
        );
      // case 'drawing':
      //   return <ShowMeTheArt onGameComplete={handleGameComplete} />;
      // ... 다른 게임 케이스들 ...
      default:
        return <div>알 수 없는 게임: {currentGameInfo?.gameCode}</div>;
    }
  };


  // 라운드 시작 카운트다운 UI (3, 2, 1만)
  if (gamePhase === "loading") {
    return <div>라운드 정보를 불러오는 중...</div>; // 로딩 UI 추가
  }

  if (gamePhase === "countdown") {
    // currentGameInfo가 아직 없을 경우를 대비한 방어 코드
    if (!currentGameInfo) return <div>게임 정보를 기다리는 중...</div>;

    // GameCountdownScreen에 API로 받아온 정보를 전달하도록 수정
    const countdownGameData = {
      ...gameData,
      gameName: currentGameInfo.gameName,
      gameDescription: currentGameInfo.gameDescription
    };
    return <GameCountdownScreen gameData={countdownGameData} countdown={countdown} />;
  }

  // 게임 플레이 중일 때만 현재 게임 렌더링
  if (gamePhase === "playing" && currentGameInfo) {
    return renderCurrentGame();
  }

  // "complete" 상태에서는 아무것도 렌더링하지 않음 (onRoundEnd가 화면 전환을 트리거)
  return null;
}
