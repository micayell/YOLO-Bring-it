import { useState, useEffect } from "react";
import type { Screen, GameData, Player, RoundResult, GameType } from "@/shared/types/game";
import { useUserLoginStore } from "@/domains/user/stores/userStore";
import apiClient from "@/shared/services/api";
import { GAME_DETAILED_CONFIG } from "@/shared/types/game";

// 백엔드 게임 코드를 프론트엔드 GameType으로 변환
const gameCodeToType = (gameCode: number): GameType => {
  const mapping: Record<number, GameType> = {
    1: "bring_object",      // 물건 가져오기 → BringIt.tsx
    2: "expression",        // 감정 표현하기 → FaceIt.tsx
    3: "color_similar",     // 비슷한 색 가져오기 → ColorIt.tsx
    4: "drawing",           // 그림 그리기 → DrawIt.tsx
    5: "blink",             // 눈싸움 → BlinkBattle.tsx
    6: "famous_line",       // 명대사 따라하기 → VoiceCrack.tsx
    7: "forbidden_word",    // 금지 단어 게임 → TrapWord.tsx
    8: "timing_click",      // 타이밍 게임 → TimeIt.tsx (정확한 시간에 버튼 클릭)
    9: "quick_press",       // 반응속도 게임 → FingerIt.tsx
    10: "headbanging"       // 플래피버드 → HeadBanging.tsx
  };
  
  return mapping[gameCode] || "bring_object"; // 기본값
};

// 변환 함수들을 export
export { gameCodeToType };

export function useGameLogic() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [gameMode, setGameMode] = useState<"quick" | "custom">("custom");
  const [gameRounds, setGameRounds] = useState(3); // ✅ 3 라운드 기본값
  
  // 유저 로그인 정보 가져오기
  const userData = useUserLoginStore((state) => state.userData);
  
  // 로그인 상태는 userData를 기반으로 계산
  const isLoggedIn = !!userData?.accessToken;

  // 앱 시작 시 localStorage에서 토큰 확인 (한 번만 실행)
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // 토큰이 있어도 자동 로그인하지 않음 - 사용자가 직접 로그인해야 함
    console.log('🔄 localStorage 토큰 확인:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken 
    });
    
  }, []); // 의존성 배열을 빈 배열로 변경 - 앱 시작 시에만 실행

  // 인증 관련 핸들러  
  const clearUser = useUserLoginStore((state) => state.clearUser);
  
  const handleLogin = () => {
    console.log("🔐 로그인 처리 완료");
    setCurrentScreen("lobby");
  };

  const handleRegister = () => {
    console.log("📝 회원가입 처리 완료");
    setCurrentScreen("lobby");
  };

  const handleLogout = () => {
    console.log("🚪 로그아웃 처리");
    clearUser(); // zustand store에서 유저 정보 제거
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setCurrentScreen("landing");
    setGameData(null);
  };

  // 화면 전환 핸들러
  const handleEnterLobby = () => {
    console.log("🎮 게임 시작 요청", { isLoggedIn, currentScreen });
    if (isLoggedIn) {
      setCurrentScreen("lobby");
    } else {
      setCurrentScreen("login");
    }
  };

  const handleJoinGame = () => {
    console.log("🎯 게임 참가 요청 - 로비에서 게임 조인으로 이동");
    setCurrentScreen("game-join");
  };

  const handleMatchmaking = (rounds: number, mode: "quick" | "custom") => {
    console.log(`🔍 매칭 요청 (라운드: ${rounds}, 모드: ${mode})`);
    setGameRounds(rounds);
    setGameMode(mode);
    setCurrentScreen("waiting-room");
  };

  const handleBackToLobby = () => {
    console.log("⬅️ 게임 조인 → 로비");
    setCurrentScreen("lobby");
  };

  const handleBackToGameJoin = () => {
    console.log("⬅️ 대기방 → 게임 조인");
    setCurrentScreen("game-join");
  };

  // 게임 시작 핸들러
  const handleStartGame = (players: Player[], roomUid: number) => {
    console.log("🚀 실제 게임 시작 요청!", { 
      playersCount: players.length,
      rounds: gameRounds,
      timestamp: new Date().toISOString()
    });
    
    if (!players || players.length === 0) {
      console.error("❌ 플레이어 데이터가 없습니다!");
      return;
    }

// Bypass ready check - already handled by backend

    console.log("🏠 사용할 Room UID:", roomUid);

    // 임시로 폴백 모드로 전환 (백엔드 서버 500 오류로 인해)
    const fetchFirstGame = async () => {
      let retryCount = 0;
      const MAX_RETRIES = 5;
      
      while (retryCount < MAX_RETRIES) {
        try {
          const accessToken = userData?.accessToken;
          console.log('🔑 인증 토큰 확인:', accessToken ? '토큰 있음' : '토큰 없음');
          
          if (!accessToken) {
            console.error('❌ 첫 번째 라운드 게임 정보 조회 실패: 인증 토큰이 없습니다. 로그인이 필요합니다.');
            return;
          }
          
          // 게임 라운드 데이터 조회 (시작 처리는 대기실에서 이미 완료됨)
          console.log(`🔄 첫 번째 라운드 게임 정보 조회... (시도: ${retryCount + 1}/${MAX_RETRIES})`);
          const response = await apiClient.get(`/games/in-game-rounds/${roomUid}/1`, {
            headers: {
              'Content-Type': 'application/json',
              'X-MEMBER-UID': userData?.memberUid?.toString() || '',
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (response.status === 200) {
            const gameInfo = response.data;
            console.log('✅ 첫 번째 라운드 게임 정보:', gameInfo);

             const mappedGameType = gameCodeToType(gameInfo.data.gameCode);
             const newGameData: GameData = {
               currentRound: 1,
               totalRounds: gameRounds,
               players: players.map(player => ({
                 ...player,
                 totalScore: 0,
                 roundScores: []
               })),
               roundResults: [],
               gameType: mappedGameType,
               gameName: GAME_DETAILED_CONFIG[mappedGameType]?.title || "",
               gameDescription: GAME_DETAILED_CONFIG[mappedGameType]?.description || "",
               roomId: roomUid
             };
            
            setGameData(newGameData);
            setCurrentScreen("game");
            console.log("✅ 게임 데이터 설정 완료", newGameData);
            return; // 성공 시 함수 종료
          } else {
            console.warn(`⚠️ 조회 실패 (status: ${response.status})`);
          }
        } catch (error) {
          console.warn(`⚠️ 라운드 정보 조회 중 오류:`, error);
        }
        
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          console.log(`⏳ 1초 후 인게임 라운드 데이터를 다시 조회합니다...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.error('❌ 최대 재시도 횟수를 초과했습니다. 게임을 시작할 수 없습니다.');
    };

    void fetchFirstGame();
  };

  // 라운드 완료 핸들러
  const handleRoundComplete = (result: RoundResult) => {
    console.log("🎯 라운드 완료", result);
    if (!gameData) {
      console.error("❌ 게임 데이터가 없습니다!");
      return;
    }

    // 점수 계산 및 게임 데이터 업데이트
    const enhancedRankings = result.rankings.map(ranking => {
      return { ...ranking, performance: ranking.performance || "완료" };
    });

    const updatedResult = { ...result, rankings: enhancedRankings };

    const updatedGameData = {
      ...gameData,
      roundResults: [...gameData.roundResults, updatedResult],
      players: gameData.players.map(player => {
        const playerResult = enhancedRankings.find(r => r.playerId === player.id);
        const roundScore = playerResult ? playerResult.score : 0;
        return {
          ...player,
          totalScore: playerResult?.globalScore !== undefined ? playerResult.globalScore : (player.totalScore + roundScore),
          roundScores: [...player.roundScores, roundScore]
        };
      })
    };

    setGameData(updatedGameData);

    if (updatedGameData.currentRound >= updatedGameData.totalRounds) {
      console.log("🏁 게임 종료 - 최종 결과로 이동");
      setCurrentScreen("final-result");
    } else {
      // setCurrentScreen("round-result"); // Handled inside GameScreen to keep WebRTC alive
    }
  };

  // 다음 라운드 핸들러
  const handleNextRound = () => {
    console.log("▶️ 다음 라운드 진행");
    if (!gameData) return;

    if (gameData.currentRound >= gameData.totalRounds) {
      console.log("🏁 게임 종료 - 최종 결과로 이동");
      setCurrentScreen("final-result");
      return;
    }

    // 백엔드 API에서 미리 정해진 게임 정보 가져오기
    const fetchNextGame = async () => {
      try {
        const accessToken = userData?.accessToken; // localStorage 대신 userData 사용
        console.log('🔑 다음 라운드 인증 토큰 확인:', accessToken ? '토큰 있음' : '토큰 없음');
        
        if (!accessToken) {
          console.error('❌ 첫 번째 라운드 게임 정보 조회 실패: 인증 토큰이 없습니다. 로그인이 필요합니다.');
          return;
        }
        
        const roomId = gameData.roomId; // gameData.roomId는 이미 number 타입
        const nextRound = gameData.currentRound + 1;
        
        const response = await apiClient.get(`/games/in-game-rounds/${roomId}/${nextRound}`, {
          headers: {
            'Content-Type': 'application/json',
            'X-MEMBER-UID': userData?.memberUid?.toString() || '',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.status < 200 || response.status >= 300) {
          console.error('게임 정보를 가져오는데 실패했습니다.');
          setCurrentScreen("waiting-room");
          return;
        }

        const gameInfo = response.data;
        console.log('🎮 다음 라운드 게임 정보:', gameInfo);
        
        const updatedGameType = gameCodeToType(gameInfo.data.gameCode);
        const updatedGameData: GameData = {
           ...gameData,
           currentRound: nextRound,
           gameType: updatedGameType, // 게임 코드를 GameType으로 변환
           gameName: GAME_DETAILED_CONFIG[updatedGameType]?.title || "",
           gameDescription: GAME_DETAILED_CONFIG[updatedGameType]?.description || ""
         };

        setGameData(updatedGameData);
        setCurrentScreen("game");
      } catch (error) {
        console.error('Failed to get game info:', error);
        setCurrentScreen("waiting-room");
      }
    };

    void fetchNextGame();
  };

  const handleGameEnd = () => {
    console.log("🏁 게임 종료 - 로비로 복귀");
    setGameData(null);
    setCurrentScreen("lobby");
  };

  // 모달 관련 핸들러
  const handleLoginClick = () => {
    console.log("🔐 로그인 모달 열기");
    setCurrentScreen("login");
  };

  const handleRegisterClick = () => {
    console.log("📝 회원가입 모달 열기");
    setCurrentScreen("register");
  };

  const handleCloseModal = () => {
    console.log("❌ 모달 닫기");
    // 현재 게임 화면에 있다면 로비로, 그렇지 않으면 랜딩으로
    if (currentScreen === "lobby" || currentScreen === "game-join" || currentScreen === "waiting-room" || currentScreen === "game" || currentScreen === "round-result" || currentScreen === "final-result") {
      setCurrentScreen("lobby");
    } else {
      setCurrentScreen("landing");
    }
  };

  const handleBackToLogin = () => {
    console.log("⬅️ 비밀번호 찾기 → 로그인 복귀");
    setCurrentScreen("login");
  };

  const handleSwitchToRegister = () => {
    console.log("🔄 로그인 → 회원가입 전환");
    setCurrentScreen("register");
  };

  const handleSwitchToLogin = () => {
    console.log("🔄 회원가입 → 로그인 전환");  
    setCurrentScreen("login");
  };

  const handleForgotPassword = () => {
    console.log("🔑 비밀번호 찾기 모달");
    setCurrentScreen("forgot-password");
  };

  return {
    // State
    currentScreen,
    isLoggedIn,
    gameData,
    gameMode,
    gameRounds,

    // Handlers
    handleLogin,
    handleRegister,
    handleLogout,
    handleEnterLobby,
    handleJoinGame,
    handleMatchmaking,
    handleBackToLobby,
    handleBackToGameJoin,
    handleStartGame,
    handleRoundComplete,
    handleNextRound,
    handleGameEnd,
    handleLoginClick,
    handleRegisterClick,
    handleCloseModal,
    handleBackToLogin,
    handleSwitchToRegister,
    handleSwitchToLogin,
    handleForgotPassword,
  };
}
