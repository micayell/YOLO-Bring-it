package com.yolo.bringit.userservice.dto.token;

import com.yolo.bringit.userservice.dto.member.MemberResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class TokenResponseDto {
    @Builder
    @Getter
    @AllArgsConstructor
    public static class TokenInfo {
        private String accessToken;
        private String refreshToken;
        private Long accessTokenExpirationTime;
        private Long refreshTokenExpirationTime;
        private MemberResponseDto.MemberInfo memberInfo;

        public void setMemberInfo(MemberResponseDto.MemberInfo memberInfo) {
            this.memberInfo = memberInfo;
        }
    }

    @Builder
    @Getter
    @AllArgsConstructor
    public static class ReissueInfo {
        private String accessToken;
    }

    @Getter
    @AllArgsConstructor
    public static class VerifyInfo {
        private boolean verified;
    }
}
