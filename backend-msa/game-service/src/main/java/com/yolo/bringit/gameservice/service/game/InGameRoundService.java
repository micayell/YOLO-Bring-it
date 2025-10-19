package com.yolo.bringit.gameservice.service.game;

import com.yolo.bringit.gameservice.dto.game.GameResponseDto;

public interface InGameRoundService {
    void createGameRounds(Long roomId);
    GameResponseDto.GameRoundInfo getGameByRound(Long roomId, Integer roundIdx);
}
