package com.yolo.bringit.userservice.dto.token;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class TokenRequestDto {
    @Builder
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Reissue {
        private String refreshToken;
    }

    @Getter
    @Setter
    public static class Verify {
        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String code;
    }
}
