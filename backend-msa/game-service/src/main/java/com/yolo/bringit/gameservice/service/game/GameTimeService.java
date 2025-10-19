package com.yolo.bringit.gameservice.service.game;

import com.yolo.bringit.gameservice.domain.game.GameTime;

import java.time.LocalDateTime;

public interface GameTimeService {
    GameTime get(Long roomId, Integer roundIdx);
}
