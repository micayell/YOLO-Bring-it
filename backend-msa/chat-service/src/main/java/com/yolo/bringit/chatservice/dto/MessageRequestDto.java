package com.yolo.bringit.chatservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class MessageRequestDto {

    @Builder
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessage {
        private Long receiverId;
        private String content;
    }
}
