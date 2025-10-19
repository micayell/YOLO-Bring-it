package com.yolo.bringit.gameservice.dto.client;

import lombok.*;

public class ClientResponseDto {
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockedMemberInfo {
        private Long memberUid;
        private String nickname;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberInfo {
        private Long memberUid;
        private String name;
        private String email;
        private String nickname;
        private String intro;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreInfo {
        private Long userId;
        private String nickname;
        private Integer rank;
        private Integer totalScore;
        private Integer playCnt;
        private Integer firstWinCnt;
        private Integer secondWinCnt;
        private Integer thirdWinCnt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MemberSimpleInfo {
        private Long memberUid;
        private String name;
        private String email;
        private String nickname;
        private String intro;
        private Integer score;
        private boolean isDeleted;
    }
}
