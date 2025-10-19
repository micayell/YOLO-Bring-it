package com.yolo.bringit.gameservice.dto.stomp;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReadyStatusResponse {
    private Long memberId;
    private boolean isReady;
}
