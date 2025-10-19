package com.yolo.bringit.userservice.service.token;

import com.yolo.bringit.userservice.domain.token.RefreshToken;

import java.util.Optional;

public interface RefreshTokenService {
    void writeTokenInfo(String email, String accessToken, String refreshToken);
    void removeRefreshToken(String refreshToken);
    Optional<RefreshToken> getRefreshToken(String refreshToken);
    String reissue(String refreshToken);
}
