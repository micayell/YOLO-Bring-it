package com.yolo.bringit.gameservice.domain.game;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameTime {

    private Long roomId;
    private Integer roundIdx;
    private Long startAt;
    private Integer durationMs;
    private Long endAt;
}
