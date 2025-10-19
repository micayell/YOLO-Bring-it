package com.yolo.bringit.userservice.dto.member;

import lombok.*;

import java.util.List;

public class MemberResponseDto {
    @Builder
    @Getter
    @AllArgsConstructor
    public static class MemberInfo {
        private Long memberUid;
        private String name;
        private String email;
        private String nickname;
        private String intro;
        private Integer xp;
        private Integer coin;
        private Integer usedCoin;
        private Integer yoloScore;
        private Integer score;
        private Integer firstWinCnt;
        private Integer secondWinCnt;
        private Integer thirdWinCnt;
        private Integer playCnt;
        private String char2dpath;
        private String char3dpath;
        private String badgename;
        private String titlepath;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BlockedMemberInfo {
        private Long memberUid;
        private String nickname;
    }

    @Builder
    @Getter
    @AllArgsConstructor
    public static class MemberInfoWithUid {
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
