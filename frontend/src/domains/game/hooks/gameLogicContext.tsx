import { createContext, useContext } from "react";
import { useGameLogic } from "./useGameLogic"; // 네 훅 경로에 맞게 수정

// useGameLogic의 반환 타입을 가져와서 Context 타입으로 사용
type GameLogicType = ReturnType<typeof useGameLogic>;

// Context 생성
const GameLogicContext = createContext<GameLogicType | null>(null);

// Provider: App에서 한 번만 감싸서 전역 공유
export const GameLogicProvider = ({ children }: { children: React.ReactNode }) => {
  const gameLogic = useGameLogic();
  return (
    <GameLogicContext.Provider value={gameLogic}>
      {children}
    </GameLogicContext.Provider>
  );
};

// Context 소비 훅
export const useGame = () => {
  const context = useContext(GameLogicContext);
  if (!context) {
    throw new Error("useGame must be used within a GameLogicProvider");
  }
  return context;
};