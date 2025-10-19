package com.yolo.bringit.gameservice.service.ranking;

import com.yolo.bringit.gameservice.dto.ranking.RankingResponseDto;

public interface RankingService {
    RankingResponseDto.GameRankingPage getRankingsByGame(Long gameCode, Long userId, int page, int size);
//    RankingResponseDto.GameRankingPage getTotalRankings(Long userId, int page, int size);
}
