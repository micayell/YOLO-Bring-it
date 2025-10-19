package com.yolo.bringit.gameservice.dto.client;

import lombok.*;

import java.util.List;

public class ClientRequestDto {

    @Builder
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateFinalScore {
        List<ClientRequestDto.FinalScorePacket> finalScoreList;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FinalScorePacket {
        long userId;
        int finalScore;
        int finalXp;
        int finalCoin;
        int currentRank;
        int totalScore;
    }
}
