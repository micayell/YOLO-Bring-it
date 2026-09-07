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
  // Time It!
  8: { diffSeconds: number };
  // Finger It!
  9: { reactionTime: number };
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
    const params = new URLSearchParams();
    
    // Convert request payload into FormData
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Blob) {
          const extension = value.type.includes('audio') ? 'webm' : 'jpg';
          formData.append(key, value, `upload.${extension}`);
        } else {
          // 멀티파트 한글 깨짐 방지를 위해 문자열은 URL 파라미터로 넘깁니다.
          params.append(key, String(value));
        }
      }
    });

    const queryString = params.toString();
    const url = `/games/game-judges/${roomId}/${roundIdx}/${gameCode}${queryString ? '?' + queryString : ''}`;

    const response = await apiClient.post(
      url,
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
