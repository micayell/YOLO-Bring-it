import { RoundResultScreen } from "@/domains/game/components/result/RoundResultScreen";
import { useState, useEffect, useRef } from "react";

import type { GameData, RoundResult } from "@/shared/types/game";
import { useLiveKitStore } from "@/domains/game/stores/livekitStore";
import { livekitService } from "@/domains/game/services/livekitService";
import { Room, ConnectionState, RoomEvent, Track } from 'livekit-client';
import { useGameWebSocket } from "@/domains/game/hooks/useGameWebSocket";
import { useUserLoginStore } from "@/domains/user/stores/userStore";
import apiClient from "@/shared/services/api";
import { toast } from "sonner";
// 분리된 컴포넌트들
import { GameCountdownScreen } from "@/domains/game/components/game";
import { FaceIt } from "@/domains/game/components/game/games/FaceIt";
import { BringIt } from "@/domains/game/components/game/games/BringIt";
import { ColorIt } from "@/domains/game/components/game/games/ColorIt";
import { DrawIt } from "@/domains/game/components/game/games/DrawIt";
// import { VoiceCrack } from "@/domains/game/components/game/games/VoiceCrack";
import { TimeIt } from "@/domains/game/components/game/games/TimeIt";
import { FingerIt } from "@/domains/game/components/game/games/FingerIt";

interface GameScreenProps {
  gameData: GameData;
  roomId: number;
  onRoundComplete: (result: RoundResult) => void;
  onGameEnd: () => void;
  onNextRound: () => void;
}

export function GameScreen({
  gameData,
  roomId,
  onRoundComplete,
  onNextRound,
  onGameEnd,
}: GameScreenProps) {
  const [gamePhase, setGamePhase] = useState<"loading" | "countdown" | "playing" | "complete" | "round-result">("loading");
  const [roundResultState, setRoundResultState] = useState<RoundResult | null>(null);
  const [roundDetailedScores, setRoundDetailedScores] = useState<any[]>([]);
  const [currentKeywords, setCurrentKeywords] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState<number>(3);
  const [gameTime, setGameTime] = useState<number>(0); // 게임 진행 시간
  const [isGameTimerRunning, setIsGameTimerRunning] = useState<boolean>(false);
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number | null>(gameData.currentRound);
  const [currentGameInfo, setCurrentGameInfo] = useState<any | null>(null);

  // 인증 정보 가져오기
  const { userData } = useUserLoginStore();
  
  // LiveKit 스토어
  const {
    room,
    participants: livekitParticipants,
    isConnecting: isLivekitConnecting,
    isConnected: isLivekitConnected,
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
  const videoRef = useRef<HTMLVideoElement>(null);

  // 인게임 웹소켓 연결
  const {
    // @ts-ignore
  isConnected: isWebSocketConnected,
    // @ts-ignore
  sendGameScore,
  } = useGameWebSocket({
    roomId: roomId,
    onRoundIntro: (data) => {
      console.log('🎮 ROUND_INTRO 수신:', data);
      setGamePhase("loading"); // 라운드 정보 로딩 시작
      setCurrentRoundIdx(data.roundIdx);
        if (data.keywords) {
          setCurrentKeywords(data.keywords);
        }
    },
    onRoundEnd: (data) => {
      console.log('🏁 ROUND_ENDED 수신:', data);
      // setGamePhase("complete");
      // 서버에서 받은 순위 정보로 결과 생성
      if (data.leaderboard) {
        const sortedDetails = [...roundDetailedScores].sort((a,b) => (b.score || 0) - (a.score || 0));
        
        const result: RoundResult = {
          round: data.roundIdx,
          gameType: gameData.gameType,
          rankings: data.leaderboard.map((r: any) => {
             const detail = roundDetailedScores.find((d: any) => String(d.memberId) === String(r.memberId));
             
             let perf = "";
             if (detail) {
                if (detail.colorScore) perf = detail.colorScore + " 일치";
                else if (detail.similarityPercent) perf = detail.similarityPercent + "% 일치";
                else if (detail.topEmotions) perf = detail.topEmotions.split(',')[0].replace(':', ' ');
             }
             
             const roundRank = detail ? sortedDetails.findIndex((d: any) => d.memberId === detail.memberId) + 1 : r.rank;

             return {
               playerId: r.memberId.toString(),
               rank: roundRank, 
               score: detail ? detail.score : 0,
               performance: perf,
               globalScore: r.totalScore
             };
          })
        };
        onRoundComplete(result);
        setRoundResultState(result);
        setGamePhase("round-result");
      }
    },
    onGameScore: (data) => {
      console.log('점수 업데이트 수신:', data);
      setRoundDetailedScores(data);
    },
    onError: (error) => {
      console.error('❌ 웹소켓 에러:', error);
    }
  });

  // 게임 페이즈가 playing이 되어 비디오 요소가 렌더링되었을 때 트랙을 attach 해줌
  useEffect(() => {
    if (gamePhase === "playing" && room && videoRef.current) {
      console.log('📹 게임 플레이 시작: 로컬 비디오 트랙을 비디오 요소에 연결합니다.');
      const videoTrack = room.localParticipant.getTrackPublication(Track.Source.Camera)?.track;
      if (videoTrack) {
        videoTrack.attach(videoRef.current);
      }
    }
  }, [gamePhase, room]);

  // LiveKit 연결 함수
  const connectToLiveKit = async () => {
    console.log('🎥 LiveKit 연결 시작...', { roomId, livekitUrl });
    setConnecting(true);
    setError(null);

    try {
      const token = await livekitService.getLiveKitToken(roomId.toString());
      console.log('✅ LiveKit 토큰 획득:', token.substring(0, 20) + '...');

      const livekitRoom = new Room({
        // noinspection SpellCheckingInspection
          dynacast: true,
      });
      
      // 이벤트 리스너 등록
      livekitRoom.on(RoomEvent.ParticipantConnected, (participant: any) => {
        console.log('👋 참가자 연결:', participant.identity);
        addParticipant(participant);
      });

      livekitRoom.on(RoomEvent.ParticipantDisconnected, (participant: any) => {
        console.log('👋 참가자 연결 해제:', participant.identity);
        removeParticipant(participant);
      });

      livekitRoom.on(RoomEvent.Disconnected, (reason) => {
        console.log('🔌 LiveKit 연결 해제:', reason);
        setConnected(false);
        setConnecting(false);
      });

      // 로컬 트랙 발행 시 비디오 요소가 이미 마운트되어있다면 바로 적용
      livekitRoom.on(RoomEvent.LocalTrackPublished, (publication) => {
        if (publication.track?.kind === 'video' && videoRef.current) {
          publication.track.attach(videoRef.current);
        }
      });

      // 연결 상태 변경 이벤트 리스너 추가
      livekitRoom.on(RoomEvent.ConnectionStateChanged, async (state) => {
        console.log('🔄 LiveKit 연결 상태 변경:', state);
        if (state === ConnectionState.Connected) {
          console.log('✅ LiveKit 미디어 엔진 연결 완료');
          await livekitRoom.localParticipant.setCameraEnabled(true);
          await livekitRoom.localParticipant.setMicrophoneEnabled(true);
          console.log('📹 로컬 카메라 및 마이크 발행 시작');
        }
      });

      // 연결
      await livekitRoom.connect(livekitUrl, token);
      console.log('✅ LiveKit 인증 성공, 미디어 엔진 연결 대기 중...');
      
      livekitRoom.remoteParticipants.forEach((p: any) => addParticipant(p));
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
      void room.disconnect();
    }
    resetLivekit();
  };

  // 라운드 정보 API 호출
  useEffect(() => {
    const fetchRoundInfo = async () => {
      if (currentRoundIdx === null || !userData?.memberUid) return;

      try {
        console.log(`📡 라운드 정보 API 호출: /in-game-rounds/${roomId}/${currentRoundIdx}`);
        const response = await apiClient.get(`/games/in-game-rounds/${roomId}/${currentRoundIdx}`, {
          headers: {
            'X-MEMBER-UID': userData?.memberUid.toString(),
          }
        });

        if(response.data?.data) {
          console.log('✅ 라운드 정보 수신:', response.data.data);
          setCurrentGameInfo(response.data.data);
          setGameTime(response.data.data.timeLimit || 60);
          setGamePhase("countdown");
          setCountdown(3);
        } else {
          toast.error("유효하지 않은 라운드 정보 형식");
          return;
        }
      } catch (error) {
        console.error('❌ 라운드 정보 불러오기 실패:', error);
        toast.error('이번 라운드 정보를 불러오는 데 실패했습니다.');
      }
    };

    void fetchRoundInfo();
  }, [currentRoundIdx, roomId, userData?.memberUid]);

  // 게임 시작 시 LiveKit 연결
  useEffect(() => {
    if (effectRan.current) {
      return;
    }

    console.log('🎮 GameScreen useEffect 실행:', { roomId, isLivekitConnecting, isLivekitConnected });
    
    if (roomId) {
      console.log('🎮 게임 시작: LiveKit 연결 시작');
      void connectToLiveKit();
    }

    effectRan.current = true;

    return () => {
      console.log('🚪 게임 종료: LiveKit 연결 해제');
      void disconnectFromLiveKit();
    };
  }, [roomId]);

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
      console.log('🚀 카운트다운 완료! 게임 시작...');
      const timer = setTimeout(() => {
        setGamePhase("playing");
        setIsGameTimerRunning(true);
        console.log('✅ 게임 페이즈를 playing으로 변경');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [countdown, gamePhase]);

  // 게임 타이머 로직
  useEffect(() => {
    if (!isGameTimerRunning || !currentGameInfo) return;

    const timer = setInterval(() => {
      setGameTime(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsGameTimerRunning(false);
          // setGamePhase("complete");
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameTimerRunning, currentGameInfo]);

  // 현재 게임에 맞는 컴포넌트를 렌더링하는 함수
  const renderCurrentGame = () => {
    const handleGameComplete = (success: boolean, _aiResults?: any[], score?: number) => {
      console.log('✅ 게임 완료:', { success, score });
      if (success && score && isWebSocketConnected && currentGameInfo) {
        console.log(`🚀 점수 전송: ${score}점`);
        sendGameScore(currentGameInfo.gameCode, score);
      }
      // setGamePhase("complete");
    };

    switch (gameData.gameType) {
      case 'bring_object':
        return <BringIt keywords={currentKeywords} videoRef={videoRef} timeLeft={gameTime} roomId={roomId} roundIdx={currentRoundIdx || 1} onGameComplete={handleGameComplete} participants={Array.from(livekitParticipants.values())} />;
      case 'expression':
        return <FaceIt keywords={currentKeywords} videoRef={videoRef} timeLeft={gameTime} roomId={roomId} roundIdx={currentRoundIdx || 1} onGameComplete={handleGameComplete} participants={Array.from(livekitParticipants.values())} />;
      case 'color_similar':
        return <ColorIt keywords={currentKeywords} videoRef={videoRef} timeLeft={gameTime} roomId={roomId} roundIdx={currentRoundIdx || 1} onGameComplete={handleGameComplete} participants={Array.from(livekitParticipants.values())} />;
      case 'drawing':
        return <DrawIt keywords={currentKeywords} videoRef={videoRef} timeLeft={gameTime} roomId={roomId} roundIdx={currentRoundIdx || 1} onGameComplete={handleGameComplete} participants={Array.from(livekitParticipants.values())} />;
      case 'timing_click':
        return (
          <TimeIt
            targetTime={5}
            currentTime={gameTime}
            timeLeft={gameTime}
            onTimeClick={() => {
              console.log("TimeIt clicked!");
              handleGameComplete(true, [], 100);
            }}
          />
        );
      case 'quick_press':
        return (
          <FingerIt
            localParticipant={room?.localParticipant}
            remoteParticipants={Array.from(livekitParticipants.values())}
            onRoundComplete={(data) => {
              const roundResult = {
                round: currentRoundIdx || 1,
                gameType: 'quick_press' as const,
                rankings: data.playerResults.map((pr, index) => ({
                  playerId: pr.id.toString(),
                  score: pr.reactionTime ? Math.max(0, 10000 - pr.reactionTime) : 0,
                  rank: index + 1,
                  performance: pr.reactionTime ? String(pr.reactionTime) : "",
                }))
              };
              onRoundComplete(roundResult);
            }}
          />
        );
      default:
        return <div>알 수 없는 게임: {gameData.gameType}</div>;
    }
  };

  if (gamePhase === "loading") {
    return <div>라운드 정보를 불러오는 중...</div>;
  }


  if (gamePhase === "round-result") {
    // For FingerIt, we pass playerResults, for others we don't
    const isFastest = roundResultState?.gameType === 'quick_press';
    const mappedFastest = isFastest ? roundResultState?.rankings.map(r => ({
      id: parseInt(r.playerId),
      name: gameData.players.find(p => String(p.id) === String(r.playerId))?.name || gameData.players.find(p => String(p.id) === String(r.playerId))?.name || '',
      reactionTime: r.score > 0 ? 10000 - r.score : null,
      status: 'completed' as const
    })) : undefined;

    return (
      <div className="absolute inset-0 z-50 bg-background">
        <RoundResultScreen 
          gameData={gameData}
          playerResults={mappedFastest}
          onGameEnd={onGameEnd}
          onNextRound={() => {
            onNextRound();
            setGamePhase("loading");
            setRoundResultState(null);
          }}
        />
      </div>
    );
  }

  if (gamePhase === "countdown") {
    if (!currentGameInfo) return <div>게임 정보를 기다리는 중...</div>;

    const countdownGameData = {
      ...gameData,
      gameName: currentGameInfo.gameName,
      gameDescription: currentGameInfo.gameDescription
    };
    return <GameCountdownScreen gameData={countdownGameData} countdown={countdown} />;
  }

  if (gamePhase === "playing" && currentGameInfo) {
    return renderCurrentGame();
  }

  return null;
}
