package com.yolo.bringit.userservice.dto.email;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class EmailResponseDto {
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmailMessage {
        private String to;
        private String subject;
        private String message;
        private String token;
    }
}
