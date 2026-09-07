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
@RedisHash(value = "fingerit")
public class FingerIt implements Serializable {

    @Id
    private String key;

    @Indexed
    private Long roomId;

    @Indexed
    private Long memberId;

    private String result;

    private Long reactionTime;

    private LocalDateTime timestamp;
}
