package com.yolo.bringit.userservice.dto.member;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.List;

public class MemberRequestDto {
    @Builder
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Login {
        @NotEmpty(message = "사용자 이메일은 필수 입력값입니다.")
        private String email;
        @NotEmpty(message = "비밀번호는 필수 입력값입니다.")
        private String password;

        public UsernamePasswordAuthenticationToken toAuthentication() {
            return new UsernamePasswordAuthenticationToken(email, password);
        }
    }

    @Data
    public static class SignUp {
        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String password;

        @NotBlank
        private String name;

        @NotBlank
        private String nickname;

        private String intro;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpdateMemberRequestDto {
        private String nickname;
        private String name;
        private String password;
        private String newpassword;
    }

    @Builder
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FindPassword {
        private String email;
        private String name;
    }

    @Builder
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NewPassword {
        private String email;
        private String token;
        private String newPassword;
    }

    @Builder
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateFinalScore {
        List<FinalScorePacket> finalScoreList;
    }

    @Builder
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinalScorePacket {
        long userId;
        int finalScore;
        int finalXp;
        int finalCoin;
        int currentRank;
        int totalScore;
    }
}
