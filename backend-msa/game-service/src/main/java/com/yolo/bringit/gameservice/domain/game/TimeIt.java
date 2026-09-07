package com.yolo.bringit.gameservice.domain.game;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@RedisHash(value = "timeit")
public class TimeIt implements Serializable {

    @Id
    private String key;

    @Indexed
    private Long roomId;

    @Indexed
    private Long memberId;

    private String result;

    private Double diffSeconds;

    private LocalDateTime timestamp;
}
