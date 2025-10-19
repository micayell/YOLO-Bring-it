package com.yolo.bringit.gameservice.dto.inGameScore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class InGameScoreResponseDto {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinalResult {
        private Long memberId;
        private String nickname;
        private int rank;
        private int totalScore;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BringItScoreResult {
        private Long memberId;
        private int score;
        private String filePath;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ColorItScoreResult {
        private Long memberId;
        private String colorScore;
        private int score;
        private String filePath;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DrawItScoreResult {
        private Long memberId;
        private String similarityPercent;
        private int score;
        private String filePath;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FaceItScoreResult {
        private Long memberId;
        private String topEmotions;
        private int score;
        private String filePath;
    }
}
