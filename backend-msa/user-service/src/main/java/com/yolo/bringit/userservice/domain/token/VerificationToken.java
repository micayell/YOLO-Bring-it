package com.yolo.bringit.userservice.domain.token;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "verification_token")
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long token_uid;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used;

    @Builder
    public VerificationToken(String email, String code, LocalDateTime expiresAt) {
        this.email = email;
        this.code = code;
        this.expiresAt = expiresAt;
    }

    public void markUsed() {
        this.used = true;
    }
}
