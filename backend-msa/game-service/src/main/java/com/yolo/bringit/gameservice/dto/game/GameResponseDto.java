package com.yolo.bringit.gameservice.dto.game;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
public class GameResponseDto {

    @Getter
    @Builder
    public static class GameRoundInfo{
        private Long gameCode;
        private String gameName;
        private String gameDescription;
    }
}