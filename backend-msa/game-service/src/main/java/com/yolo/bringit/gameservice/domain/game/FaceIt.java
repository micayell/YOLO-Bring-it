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
@RedisHash(value = "faceit")
public class FaceIt implements Serializable {

    @Id
    private String key; // room:{roomId}:member:{memberId}

    @Indexed
    private Long roomId;

    @Indexed
    private Long memberId;

    private String result;

    private String topEmotions;

    private LocalDateTime timestamp; // 제출 시간
    private String filePath;
}