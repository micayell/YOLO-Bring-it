package com.yolo.bringit.gameservice.domain.liveKit;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDateTime;

@Getter
@RedisHash("video_participant")
public class VideoParticipant {

    @Id
    private String id;
    private String roomId;
    private String identity; // memberUid
    private boolean isJoined;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;

    @Builder
    public VideoParticipant(String roomId, String identity, boolean isJoined, LocalDateTime joinedAt, LocalDateTime leftAt) {
        this.id = "room:" + roomId + ":identity:" + identity;
        this.roomId = roomId;
        this.identity = identity;
        this.isJoined = isJoined;
        this.joinedAt = joinedAt;
        this.leftAt = leftAt;
    }
}
