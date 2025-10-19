package com.yolo.bringit.gameservice.dto.ranking;

import lombok.*;

import java.util.List;

public class RankingResponseDto {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameRanking {
        private int place;
        private String nickname;
        private int score;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameRankingPage {
        private GameRanking myRanking;
        private List<GameRanking> rankings;
        private boolean hasNext;
    }
}
