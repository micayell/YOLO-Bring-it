import apiClient from './api';

// 라운드 점수 저장
export const saveRoundScore = async (
  roomId: number,
  gameCode: number,
  score: number,
  userId: number
) => {
  try {
    const response = await apiClient.post(
      `/games/in-game-scores/${roomId}/${gameCode}`,
      null,
      {
        params: { score },
        headers: { 'X-MEMBER-UID': userId },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error saving round score:', error);
    throw error;
  }
};

// 최종 점수 저장
export const saveFinalScore = async (roomId: number, userId: number) => {
  try {
    const response = await apiClient.post(
      `/games/in-game-scores/${roomId}/final`,
      null,
      {
        headers: { 'X-MEMBER-UID': userId },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error saving final score:', error);
    throw error;
  }
};

interface YoloScoreParams {
  roomId: number;
}

// Yolo 칭찬 점수 저장
export const saveYoloUp = async (memberId: number, params: YoloScoreParams) => {
  try {
    const response = await apiClient.post(
      `/games/in-game-scores/${memberId}/yolo-up`,
      params
    );
    return response.data;
  } catch (error) {
    console.error('Error saving yolo up score:', error);
    throw error;
  }
};

// Yolo 불쾌 점수 저장
export const saveYoloDown = async (
  memberId: number,
  params: YoloScoreParams
) => {
  try {
    const response = await apiClient.post(
      `/games/in-game-scores/${memberId}/yolo-down`,
      params
    );
    return response.data;
  } catch (error) {
    console.error('Error saving yolo down score:', error);
    throw error;
  }
};
