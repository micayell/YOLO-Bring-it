package com.yolo.bringit.userservice.dto.stomp;

import lombok.*;

public class StompDto {
    @Builder
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendNotificationDto {
        private Long senderId;
        private String senderNickname;
        private String message;
    }

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
    public static class ReadyStatusResponse {
        private Long memberId;
        private boolean isReady;
    }

    @Builder
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementNotificationDto {
        private Long memberId;
        private Long achievementId;
        private String achievementName;
        private String achievementExp;
    }

}
