package com.yolo.bringit.gameservice.domain.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@RedisHash(value = "gameScore", timeToLive = 60 * 60)
public class InGameScore {

    @Id
    private String key;

    private Long roomId; //room id

    private Long memberId; //사용자 id

    private int totalScore; //총합 점수

    private Map<Long, Integer> gameScores; //gamecode, score 저장 map

    public void changeGameScores(Map<Long, Integer> gameScores) {
        this.gameScores = gameScores;
    }

    public void changeTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }
}
