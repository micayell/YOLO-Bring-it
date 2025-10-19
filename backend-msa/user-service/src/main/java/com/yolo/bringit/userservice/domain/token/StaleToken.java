package com.yolo.bringit.userservice.domain.token;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@RedisHash(value="stk", timeToLive = 60*60)
@ToString
public class StaleToken {
    @Id
    private String accessToken;

    @Builder
    public StaleToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
