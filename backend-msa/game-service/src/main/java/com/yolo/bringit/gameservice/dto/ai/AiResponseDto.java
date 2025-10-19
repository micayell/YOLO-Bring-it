package com.yolo.bringit.gameservice.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.util.List;

public class AiResponseDto {

    @Getter
    @Builder
    public static class ColorScoreInfo {
        @JsonProperty("userId")
        private Long userId;

        @JsonProperty("result")
        private String result;

        @JsonProperty("colorScore")
        private Double colorScore; // 유사도 점수 (%)

        @JsonProperty("error")
        private String error;
    }

    @Getter
    @Builder
    public static class FaceAnalysisInfo {
        @JsonProperty("userId")
        private Long userId;

        @JsonProperty("result")
        private String result;

        @JsonProperty("top_emotions")
        private List<String> topEmotions;

        @JsonProperty("error")
        private String error;
    }

    @Getter
    @Builder
    public static class ObjectDetectionInfo {
        @JsonProperty("userId")
        private Long userId;

        @JsonProperty("result")
        private String result;

        @JsonProperty("error")
        private String error;
    }

    @Getter
    @Builder
    public static class PictureSimilarityInfo {
        @JsonProperty("userId")
        private Long userId;

        @JsonProperty("result")
        private String result;

        @JsonProperty("similarity_percent")
        private String similarityPercent;

        @JsonProperty("error")
        private String error;
    }

    @Getter
    @Builder
    public static class VoiceGradeInfo {
        @JsonProperty("userId")
        private Long userId;

        @JsonProperty("result")
        private String result;

        @JsonProperty("target_text")
        private String targetText;

        @JsonProperty("user_text")
        private String userText;

        @JsonProperty("text_score_percent")
        private Double textScorePercent;

        @JsonProperty("audio_score_percent")
        private Double audioScorePercent;

        @JsonProperty("overall_score_percent")
        private Double overallScorePercent;

        @JsonProperty("error")
        private String error;
    }
}
