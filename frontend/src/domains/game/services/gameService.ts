import apiClient from '@/shared/services/api';

export type GameRequest = {
  // Bring It!
  1: { image?: Blob; targetItem: string };
  // Face It!
  2: { image?: Blob; doEmotion: string };
  // Color Killer
  3: { image?: Blob; r: number; g: number; b: number };
  // Draw It!
  4: { image?: Blob; targetPicture: string };
  // Sound It!
  6: { targetAudioPath?: Blob; userAudioPath?: Blob; language: string };
};

interface JudgeGameParams<T extends keyof GameRequest> {
  roomId: number | string;
  roundIdx: number | string;
  gameCode: T;
  userId: number | string;
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
    const formData = new FormData();
    
    // Convert request payload into FormData
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Blob) {
          const extension = value.type.includes('audio') ? 'webm' : 'jpg';
          formData.append(key, value, `upload.${extension}`);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await apiClient.post(
      `/games/game-judges/${roomId}/${roundIdx}/${gameCode}`,
      formData,
      {
        headers: {
          'X-MEMBER-UID': String(userId),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error judging game:', error);
    throw error;
  }
};
