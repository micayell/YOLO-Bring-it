package com.yolo.bringit.gameservice.service.game;

import com.yolo.bringit.gameservice.domain.game.GameTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class GameTimeServiceImpl implements GameTimeService {

    private final StringRedisTemplate redis;

    public GameTime get(Long roomId, Integer roundIdx) {
        String key = String.format("room:%d:round:%d", roomId, roundIdx);
        List<Object> vals = redis.opsForHash()
                .multiGet(key, List.of("startAt", "durationMs", "endAt"));

        if (vals.size() != 3 || vals.stream().anyMatch(Objects::isNull)) {
            return null;
        }

        Long startAt = vals.get(0) == null ? null: Long.parseLong(vals.get(0).toString());
        Integer durationMs = vals.get(1) == null ? null: Integer.parseInt(vals.get(1).toString());
        Long endAt = vals.get(2) == null ? null: Long.parseLong(vals.get(2).toString());

        return GameTime.builder()
                .roomId(roomId)
                .roundIdx(roundIdx)
                .startAt(startAt)
                .durationMs(durationMs)
                .endAt(endAt)
                .build();
    }
}
