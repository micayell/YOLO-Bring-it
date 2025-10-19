package com.yolo.bringit.userservice.service.token;

import com.yolo.bringit.userservice.domain.token.VerificationToken;
import com.yolo.bringit.userservice.dto.email.EmailResponseDto;
import com.yolo.bringit.userservice.repository.member.MemberRepository;
import com.yolo.bringit.userservice.repository.token.VerificationTokenRepository;
import com.yolo.bringit.userservice.util.EmailUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationTokenServiceImpl implements VerificationTokenService {
    private final VerificationTokenRepository verificationTokenRepository;
    private final MemberRepository memberRepository;
    private final EmailUtil emailUtil;

    @Transactional
    @Override
    public void sendSignUpCode(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        verificationTokenRepository.deleteByEmail(email);

        String code = emailUtil.createCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        VerificationToken token = VerificationToken.builder()
                .email(email)
                .code(code)
                .expiresAt(expiresAt)
                .build();
        verificationTokenRepository.save(token);

        EmailResponseDto.EmailMessage msg = EmailResponseDto.EmailMessage.builder()
                .to(email)
                .subject("[Yolo Bring It] 회원가입 인증 코드 안내")
                .message(code)
                .build();
        emailUtil.sendMail(msg, "email/signup");
    }

    @Override
    @Transactional
    public void verifyCode(String email, String code) {
        VerificationToken token = verificationTokenRepository
                .findTopByEmailAndCodeAndUsedFalseOrderByExpiresAtDesc(email, code)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 인증코드입니다."));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("인증 코드가 만료되었습니다.");
        }

        token.markUsed();
        verificationTokenRepository.save(token);
    }
}
