package com.yolo.bringit.gameservice.dto.stomp;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GameStartSignal {
    private boolean canStart;
}
