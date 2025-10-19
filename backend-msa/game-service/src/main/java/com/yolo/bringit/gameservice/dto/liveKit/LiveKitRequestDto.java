package com.yolo.bringit.gameservice.dto.liveKit;

import lombok.*;

public class LiveKitRequestDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class HandleWebhook {
        private String event;
        private String room;
        private Participant participant;
        private Long timestamp;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Participant {
        private String identity;
        private String name;
    }
}
