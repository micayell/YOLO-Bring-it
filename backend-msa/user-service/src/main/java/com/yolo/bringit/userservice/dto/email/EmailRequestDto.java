package com.yolo.bringit.userservice.dto.email;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class EmailRequestDto {
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SendCode {
        private String email;
    }

    @Data
    public static class SignUpEmail {
        @Email
        @NotBlank
        private String email;
    }
}
