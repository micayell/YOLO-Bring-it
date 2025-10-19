package com.yolo.bringit.userservice.service.password;

import com.yolo.bringit.userservice.domain.password.PasswordResetToken;
import com.yolo.bringit.userservice.repository.password.PasswordResetTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetTokenServiceImpl implements PasswordResetTokenService {
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Override
    @Transactional
    public void writeTokenInfo(String email, String passwordResetToken) {
        passwordResetTokenRepository.save(PasswordResetToken.builder()
                        .email(email)
                        .passwordResetToken(passwordResetToken)
                        .build());
    }

    @Override
    @Transactional
    public Optional<PasswordResetToken> getPasswordResetToken(String passwordResetToken) {
        return passwordResetTokenRepository.findByPasswordResetToken(passwordResetToken);
    }
}
