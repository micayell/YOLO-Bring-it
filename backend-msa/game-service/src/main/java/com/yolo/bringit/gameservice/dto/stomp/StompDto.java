package com.yolo.bringit.gameservice.dto.stomp;

import com.yolo.bringit.gameservice.dto.inGameScore.InGameScoreResponseDto;
import lombok.*;
import org.apache.commons.lang3.function.Failable;

import java.util.List;
import java.util.Map;

public class StompDto {

    @Builder
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantNotificationDto {
        private Long senderId;
        private Long roomId;
        private String senderNickname;
        private String message;
    }

    @Builder
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameStartNotificationDto {
        private String type;
        private Long roomId;
        private Integer roundIdx;

        // epoch ms
        private Long serverNow; // 클라이언트 offset 보정용
        private Long startAt;
        private Integer durationMs;

        // 키워드(제시어)
        private Map<String, String> keywords;
    }

    @Builder
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameEndNotificationDto {
        private String type;
        private Long roomId;
        private Integer roundIdx;
        private Long gameCode;

        private Long serverNow;
        private Long endAt;

        private List<InGameScoreResponseDto.FinalResult> leaderboard;
    }

    @Builder
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameRoundResultNotificationDto {
        private String type;
        private Long roomId;
        private Integer roundIdx;
        private Long memberId;
        private String result;
    }
}
