package com.yolo.bringit.userservice.repository.token;

import com.yolo.bringit.userservice.domain.token.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    /* 인증 코드 일치 여부 확인 */
    Optional<VerificationToken> findTopByEmailAndCodeAndUsedFalseOrderByExpiresAtDesc(String email, String code);

    /* 특정 이메일의 모든 토큰 삭제 */
    void deleteByEmail(String email);

    /* 특정 이메일에 대해 이미 사용한 토큰이 있는지 확인 */
    boolean existsByEmailAndUsedTrue(String email);
}
