package com.yolo.bringit.userservice.domain.member;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@RedisHash(value = "online_member", timeToLive = 60 * 60) // TTL: 1시간
public class OnlineMember {
    @Id
    private Long memberId;
}
