package com.yolo.bringit.userservice.service.password;

import com.yolo.bringit.userservice.domain.password.PasswordResetToken;

import java.util.Optional;

public interface PasswordResetTokenService {
    void writeTokenInfo(String email, String passwordResetToken);
    Optional<PasswordResetToken> getPasswordResetToken(String passwordResetToken);
}
