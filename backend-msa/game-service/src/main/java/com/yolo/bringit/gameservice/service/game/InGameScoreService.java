package com.yolo.bringit.gameservice.service.game;

import com.yolo.bringit.gameservice.dto.inGameScore.InGameScoreResponseDto;

import java.util.List;

public interface InGameScoreService {
    void saveScore(Long gameCode, Long roomId, Long memberId, int score);
    List<InGameScoreResponseDto.FinalResult> sortScore(Long gameCode, Long roomId);
    List<InGameScoreResponseDto.FinalResult> saveFinalScore(Long userId, Long roomId);
    void saveYoloUp(Long roomId, Long memberId);
    void saveYoloDown(Long roomId, Long memberId);
    void BringitprocessScoring(Long roomId);
    void ColoritprocessScoring(Long roomId);
    void DrawitprocessScoring(Long roomId);
    void FaceitprocessScoring(Long roomId);
}
