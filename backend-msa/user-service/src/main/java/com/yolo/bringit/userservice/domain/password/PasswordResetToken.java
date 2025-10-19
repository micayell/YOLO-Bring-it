package com.yolo.bringit.userservice.domain.password;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@RedisHash(value="prtk", timeToLive = 60*3) // 3분간만 유효
@ToString
public class PasswordResetToken {
    @Id
    private String email;

    @Indexed
    private String passwordResetToken;

    @Builder
    public PasswordResetToken(String email, String passwordResetToken) {
        this.email = email;
        this.passwordResetToken = passwordResetToken;
    }
}
