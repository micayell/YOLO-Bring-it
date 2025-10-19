package com.yolo.bringit.userservice.domain.token;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@RedisHash(value="rtk", timeToLive = 60*60*24*7)
@ToString
public class  RefreshToken {
    @Id
    private String email;

    @Indexed
    private String accessToken;
    @Indexed
    private String refreshToken;

    @Builder
    public RefreshToken(String email, String accessToken, String refreshToken) {
        this.email = email;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
