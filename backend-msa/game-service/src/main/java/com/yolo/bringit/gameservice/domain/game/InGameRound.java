package com.yolo.bringit.gameservice.domain.game;

import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.redis.core.RedisHash;

import java.io.Serializable;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@RedisHash("game_round")
public class InGameRound implements Serializable {

    @Id
    private String id;
    private Long roomId;
    private Integer roundIdx;
    private Long gameCode;

    @Builder
    public InGameRound(Long roomId, Integer roundIdx, Long gameCode) {
        this.id = roomId+":"+roundIdx;
        this.roomId = roomId;
        this.roundIdx = roundIdx;
        this.gameCode = gameCode;
    }
}
