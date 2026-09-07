import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { LoginForm } from "@/domains/user/components/auth/LoginForm";
import { RegisterForm } from "@/domains/user/components/auth/RegisterForm";
import { LobbyScreen } from "@/domains/game/components/lobby/LobbyView";
import { GameJoinScreen } from "@/domains/game/components/game/GameJoinScreen";
import { GameScreen } from "@/domains/game/components/game/GameScreen";
import { RoundResultScreen } from "@/domains/game/components/result/RoundResultScreen";
import { FinalResultScreen } from "@/domains/game/components/result/FinalResultScreen";
import { LandingPage } from "@/pages/LandingPage";
import { ThemeProvider } from "@/shared/lib/ThemeContext";
import { ChatModalWrapper } from "@/domains/chat/components/chats/ChatModalWrapper";
import { GameLogicProvider, useGame } from "@/domains/game/hooks/gameLogicContext";
import { ForgotPasswordForm } from "@/domains/user/components/auth/ForgotPasswordForm";
import { ResetPasswordPage } from "@/domains/user/components/auth/ResetPasswordPage";
import { useUserWebSocket } from "@/domains/user/hooks/useUserWebSocket";
import { QuickMatchWaitingRoom } from "@/domains/game/components/room/QuickMatchWaitingRoom";
import { CustomGameWaitingRoom } from "@/domains/game/components/room/CustomGameWaitingRoom";
import { InvitationModal } from "@/shared/ui/InvitationModal"; // 1. 초대 모달 import
import { useGlobalWebSocket } from "@/app/hooks/useGlobalWebSocket"; // 전역 웹소켓 훅

export type { GameData, Player, RoundResult, PlayerRanking } from "@/shared/types/game";
import type { Player } from "@/shared/types/game";


// --- 로그인 보호용 래퍼 ---
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isLoggedIn } = useGame();
  if (!isLoggedIn) {
    // 로그인 안됐으면 랜딩으로
    return <Navigate to="/" replace />;
  }
  return children;
}

function LobbyRoute() {
  const { handleLogout } = useGame();
  const navigate = useNavigate();

  return (
    <LobbyScreen
      onLogout={handleLogout}
      onStartGame={() => navigate("/join")}
    />
  );
}

function GameJoinRoute() {
  const { handleMatchmaking } = useGame();
  const navigate = useNavigate();

  return (
    <GameJoinScreen
      onBack={() => navigate("/lobby")}
      onMatchmaking={(rounds, mode) => {
        handleMatchmaking(rounds, mode); // ✅ 인자 2개 그대로 전달
        navigate(`/waiting?mode=${mode}&rounds=${rounds}`); // 선택사항
      }}
    />
  );
}

function WaitingRoomRoute() {
  const { handleStartGame } = useGame();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const mode = (params.get("mode") as "quick" | "custom") ?? "custom";
  const existingRoomId = params.get("roomId"); // 초대받은 roomId 읽기
  const rounds = params.get("rounds") ? Number(params.get("rounds")) : 5;

  const handleGameStart = (players: Player[], roomUid: number) => {
    console.log("🎮 App.tsx: 게임 시작 - 네비게이션 시작");
    handleStartGame(players, roomUid);
  };

  if (mode === 'quick') {
    return (
      <QuickMatchWaitingRoom
        onStartGame={handleGameStart}
        onBack={() => navigate("/join")}
        existingRoomId={existingRoomId ? Number(existingRoomId) : undefined}
      />
    );
  }

  return (
    <CustomGameWaitingRoom
      onStartGame={handleGameStart}
      onBack={() => navigate("/join")}
      existingRoomId={existingRoomId ? Number(existingRoomId) : undefined} // roomId 전달
      rounds={rounds}
    />
  );
}

// --- 비밀번호 재설정 라우트 (메일 링크 진입용 /resetpassword?token=...) ---
function ResetPasswordRoute() {
  // ResetPasswordPage 내부에서 useSearchParams로 token 읽고, 성공 시 navigate("/")
  return <ResetPasswordPage />;
}

// --- 기존 상태 머신 화면은 그대로 유지(원하면 라우팅으로 나중에 추가) ---
function GameFlowScreens() {
  const navigate = useNavigate();
  const {
    currentScreen,
    gameData,
    handleLogin,
    handleRegister,
    handleCloseModal,
    handleSwitchToRegister,
    handleSwitchToLogin,
    handleForgotPassword,
    handleRoundComplete,
    handleNextRound,
    handleGameEnd,
  } = useGame();

  // 라우팅된 페이지들 외의(게임 본편)만 스위치 유지
  const renderGameScreens = () => {
    

    switch (currentScreen) {
      case "game":
        return gameData ? (
          <GameScreen
            gameData={gameData}
            roomId={gameData.roomId}
            onRoundComplete={handleRoundComplete}
            onGameEnd={handleGameEnd}
            onNextRound={handleNextRound}
          />
        ) : null;
      case "round-result":
        return gameData ? (
          <RoundResultScreen
            gameData={gameData}
            onNextRound={handleNextRound}
            onGameEnd={handleGameEnd}
          />
        ) : null;
      case "final-result":
        return gameData ? (
          <FinalResultScreen
            gameData={gameData}
            onGameEnd={() => {
              handleGameEnd();
              navigate("/lobby"); // 로비로 명시적 이동
            }}
            onRestartGame={() => {
              handleGameEnd();
              navigate("/waiting"); // 대기방으로 돌아가서 다시 게임 준비
            }}
            roomId={gameData.roomId.toString()}
          />
        ) : null;
      // Landing 페이지에서는 아무것도 렌더링하지 않음
      case "landing":
        return null;
      default:
        // 게임 진행 중이 아닐 때는 아무것도 렌더링하지 않음
        return null;
    }
  };

  const gameScreenContent = renderGameScreens();

  // 게임 본편(진행 중)일 때만 렌더링하도록 수정
  if (!gameScreenContent) {
    // 게임 진행중이 아닐 때는 모달만 렌더링할 수 있도록 분리
    return (
      <AnimatePresence>
        {currentScreen === "login" && (
          <LoginForm
            onLogin={() => {
              handleLogin();
              navigate("/lobby");
            }}
            onClose={handleCloseModal}
            onSwitchToRegister={handleSwitchToRegister}
            onForgotPassword={handleForgotPassword}
          />
        )}

        {currentScreen === "register" && (
          <RegisterForm
            onRegister={() => {
              handleRegister();
              navigate("/lobby");
            }}
            onClose={handleCloseModal}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}

        {/* ⭐ 비밀번호 찾기 모달 */}
        {currentScreen === "forgot-password" && (
          <ForgotPasswordForm
            onClose={handleCloseModal}
            onBackToLogin={handleSwitchToLogin}
          />
        )}
      </AnimatePresence>
    );
  }

  // 게임 본편(진행 중)일 때 전체 화면을 덮어서 렌더링
  return (
    <div className="fixed inset-0 z-50 h-screen w-full bg-background">
      {gameScreenContent}
    </div>
  );
}

function AppRoutes() {
  const {
    isLoggedIn,
    handleLoginClick,
    handleRegisterClick,
    handleLogout,
  } = useGame();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* 랜딩 */}
      <Route
        path="/"
        element={
          <LandingPage
            isLoggedIn={isLoggedIn}
            onLoginClick={handleLoginClick}
            onRegisterClick={handleRegisterClick}
            onLogout={handleLogout}
            onGameStart={() => {
              if (isLoggedIn) {
                navigate("/lobby"); // ✅ 로그인 상태면 로비로 이동
              } else {
                handleLoginClick(); // ✅ 비로그인 상태면 로그인 모달 오픈
              }
            }}
          />
        }
      />

      {/* ⭐ 비밀번호 재설정(메일 링크) - 비보호 라우트 */}
      <Route path="/reset-password" element={<ResetPasswordRoute />} />



      {/* 보호 라우트들 */}
      <Route
        path="/lobby"
        element={
          <ProtectedRoute>
            <LobbyRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/join"
        element={
          <ProtectedRoute>
            <GameJoinRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/waiting"
        element={
          <ProtectedRoute>
            <WaitingRoomRoute />
          </ProtectedRoute>
        }
      />


      {/* 그 외는 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppContent() {
  useGlobalWebSocket(); // 게임 초대 등 전역 웹소켓 연결
  useUserWebSocket(); // 친구 상태, 업적 등 유저 웹소켓 연결
  const { currentScreen } = useGame(); // useGame 훅에서 currentScreen 상태 가져오기

  const isGameInProgress =
    currentScreen === "game" ||
    currentScreen === "round-result" ||
    currentScreen === "final-result";
    
  return (
    <>
      {/* 라우팅된 페이지 */}
      {!isGameInProgress && <AppRoutes />}
      {/* 라우팅 안 한 게임 본편 화면은 상태 기반으로 계속 렌더 */}
      <GameFlowScreens />
      <InvitationModal /> {/* 2. 앱 최상위에 모달 렌더링 */}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <GameLogicProvider>
          <AppContent />
          <ChatModalWrapper />
        </GameLogicProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
