import apiClient from './api';

// 각 게임별 요청 파라미터 타입을 명시적으로 정의
export type GameRequest = {
  // Bring It!
  1: { imagePath: string; targetItem: string };
  // Face It!
  2: { imagePath: string; doEmotion: string };
  // Color Killer
  3: { imagePath: string; r: string; g: string; b: string };
  // Draw It!
  4: { imagePath: string; targetPicture: string };
  // Sound It!
  6: { imagePath: string; targetAudioPath: string; userAudioPath: string; language: string };
};

// 제네릭을 사용하여 gameCode에 따라 request 타입이 결정되도록 설정
interface JudgeGameParams<T extends keyof GameRequest> {
  roomId: number;
  roundIdx: number;
  gameCode: T;
  userId: number;
  request: GameRequest[T];
}

export const judgeGame = async <T extends keyof GameRequest>({
  roomId,
  roundIdx,
  gameCode,
  userId,
  request,
}: JudgeGameParams<T>) => {
  try {
    const response = await apiClient.post(
      `/games/game-judges/${roomId}/${roundIdx}/${gameCode}`,
      null, // request body
      {
        headers: {
          'X-MEMBER-UID': userId,
        },
        params: request, // query parameters
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error judging game:', error);
    throw error;
  }
};
