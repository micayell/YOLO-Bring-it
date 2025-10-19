package com.yolo.bringit.gameservice.service.game;

import com.yolo.bringit.gameservice.dto.stomp.StompDto;
import com.yolo.bringit.gameservice.repository.room.RoomMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final InGameScoreService inGameScoreService;
    private final RoomMemberRepository roomMemberRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final StringRedisTemplate redis;

    @Qualifier("gameTaskScheduler")
    private final TaskScheduler taskScheduler; // 주입

    public void gameStartSocket(Long roomId, Integer roundIdx, Long gameCode, Map<String, String> keywords) {
        long now = System.currentTimeMillis();
        int introMs = 5_000;
        long startAt = now + introMs;
        int durationMs;

        switch (gameCode.intValue()) {
            case 1 -> durationMs = 20_000;   // bring it: 20초
            case 2 -> durationMs = 10_000;  // face it: 10초
            case 3 -> durationMs = 20_000;   // color killer: 20초
            case 4 -> durationMs = 20_000; // draw it: 20초
            default -> durationMs = 0;
        }

        saveGameTime(roomId, roundIdx, now, startAt, durationMs);

        StompDto.GameStartNotificationDto notification = StompDto.GameStartNotificationDto.builder()
                .type("ROUND_INTRO")
                .roomId(roomId)
                .roundIdx(roundIdx)
                .serverNow(now) // 클라이언트 offset 보정용
                .startAt(startAt)
                .durationMs(durationMs)
                .keywords(keywords)
                .build();

        long endAt = startAt + durationMs;
        taskScheduler.schedule(
                () -> finishRound(roomId, roundIdx, gameCode),
                new java.util.Date(endAt)
        );

        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, notification);
    }

    @Override
    public void gameEndSocket(Long roomId, Integer roundIdx, Long gameCode) {
        String key = String.format("room:%d:round:%d", roomId, roundIdx);

        Object o = redis.opsForHash().get(key, "endAt");

        StompDto.GameEndNotificationDto notification = StompDto.GameEndNotificationDto.builder()
                .type("ROUND_ENDED")
                .gameCode(gameCode)
                .roomId(roomId)
                .roundIdx(roundIdx)
                .serverNow(System.currentTimeMillis())
                .endAt(o == null ? null : Long.parseLong(o.toString()))
                .leaderboard(inGameScoreService.sortScore(gameCode, roomId))
                .build();

        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, notification);
    }

    @Override
    public void gameRoundPassSocket(Long roomId, Integer roundIdx, Long gameCode, Long memberId, String result) {
        StompDto.GameRoundResultNotificationDto notification = StompDto.GameRoundResultNotificationDto.builder()
                .type("ROUND_RESULT")
                .roomId(roomId)
                .roundIdx(roundIdx)
                .memberId(memberId)
                .result(result)
                .build();

        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, notification);
    }

    @Override
    public int markArrived(Long roomId, Integer roundIdx, Long memberId) {
        String key = String.format("room:%d:round:%d:arrived", roomId, roundIdx);
        redis.opsForSet().add(key, String.valueOf(memberId)); // SADD (Set add)

        Long ttl = redis.getExpire(key);
        if (ttl < 0)
            redis.expire(key, java.time.Duration.ofMinutes(5)); // TTL 설정

        Long size = redis.opsForSet().size(key); // SCARD
        return size == null ? 0 : size.intValue();
    }

    @Override
    public void clearArrived(Long roomId, Integer roundIdx) {
        String key = String.format("room:%d:round:%d:arrived", roomId, roundIdx);
        redis.delete(key);
    }

    @Override
    public int getPlayersNumber(Long roomId) {
        return roomMemberRepository.countByRoom_RoomUid(roomId);
    }

    @Override
    public boolean acquireStartLock(Long roomId, Integer roundIdx, int expireSec) {
        String key = String.format("room:%d:round:%d:start.lock", roomId, roundIdx);
        Boolean check = redis.opsForValue().setIfAbsent(key, "1", java.time.Duration.ofSeconds(expireSec));
        return Boolean.TRUE.equals(check);
    }

    @Override
    public void saveGameTime(Long roomId, Integer roundIdx, long now, long startAt, int durationMs) {
        String key = String.format("room:%d:round:%d", roomId, roundIdx);
        long endAt = startAt + durationMs;

        redis.opsForHash().put(key, "startAt", String.valueOf(startAt));
        redis.opsForHash().put(key, "durationMs", String.valueOf(durationMs));
        redis.opsForHash().put(key, "endAt", String.valueOf(endAt));


        long graceMs = 10_000L;
        long ttlSec = Math.max(1, (endAt + graceMs - now + 999) / 1000);
        redis.expire(key, java.time.Duration.ofSeconds(ttlSec));
    }

    @Override
    public void finishRound(Long roomId, Integer roundIdx, Long gameCode) {
        String key = String.format("room:%d:round:%d:finish", roomId, roundIdx);
        Boolean acquired = redis.opsForValue().setIfAbsent(key, "1", java.time.Duration.ofMinutes(30));

        if (!Boolean.TRUE.equals(acquired)) return; // 이미 다른 인스턴스/경로에서 종료 처리된 경우

        switch (gameCode.intValue()) {
            case 1 -> inGameScoreService.BringitprocessScoring(roomId);
            case 2 -> inGameScoreService.FaceitprocessScoring(roomId);
            case 3 -> inGameScoreService.ColoritprocessScoring(roomId);
            case 4 -> inGameScoreService.DrawitprocessScoring(roomId);
            default -> {  } // TODO: 확장 필요
        }

        gameEndSocket(roomId, roundIdx, gameCode); // 소켓

        clearArrived(roomId, roundIdx); // redis 내 모든 키 삭제
    }

    @Override
    public Map<String, String> getKeyword(Long gameCode) {
        List<Map<String, String>> list = switch (gameCode.toString()) {
            case "1" -> BringItItems;
            case "2" -> FaceItItems;
            case "4" -> DrawItItems;
            // TODO : 게임 확장 시 추가 필요
            default -> throw new IllegalArgumentException("해당 게임이 존재하지 않습니다.");
        };

        int randomIdx = ThreadLocalRandom.current().nextInt(list.size());
        return list.get(randomIdx);
    }

    @Override
    public Map<String, String> getRGB() {
        int r = ThreadLocalRandom.current().nextInt(256);
        int g = ThreadLocalRandom.current().nextInt(256);
        int b = ThreadLocalRandom.current().nextInt(256);

        return Map.of("r", String.valueOf(r), "g", String.valueOf(g), "b", String.valueOf(b));
    }

    private static final List<Map<String, String>> BringItItems = List.of(
//            Map.of("en", "umbrella", "ko", "우산"),
//            Map.of("en", "backpack", "ko", "가방"),
//            Map.of("en", "bottle", "ko", "병"),
//            Map.of("en", "cup", "ko", "컵"),
//            Map.of("en", "fork", "ko", "포크"),
//            Map.of("en", "spoon", "ko", "숟가락"),
//            Map.of("en", "bowl", "ko", "사발"),
//            Map.of("en", "chair", "ko", "의자"),
//            Map.of("en", "potted plant", "ko", "화분"),
//            Map.of("en", "mouse", "ko", "마우스"),
//            Map.of("en", "remote", "ko", "리모컨"),
//            Map.of("en", "keyboard", "ko", "키보드"),
            Map.of("en", "cell phone", "ko", "핸드폰")
//            Map.of("en", "book", "ko", "책"),
//            Map.of("en", "clock", "ko", "시계"),
//            Map.of("en", "vase", "ko", "꽃병"),
//            Map.of("en", "scissors", "ko", "가위"),
//            Map.of("en", "teddy bear", "ko", "곰인형"),
//            Map.of("en", "hair drier", "ko", "헤어드라이어"),
//            Map.of("en", "toothbrush", "ko", "칫솔")
    );

    private static final List<Map<String, String>> FaceItItems = List.of(
            Map.of("en", "angry", "ko", "분노"),
            Map.of("en", "disgust", "ko", "역겨움"),
            Map.of("en", "fear", "ko", "두려움"),
            Map.of("en", "happy", "ko", "행복"),
            Map.of("en", "sad", "ko", "슬픔"),
            Map.of("en", "surprise", "ko", "놀라운"),
            Map.of("en", "neutral", "ko", "평상시(무표정)")
    );

    private static final List<Map<String, String>> DrawItItems = List.of(
            Map.of("en", "dog", "ko", "개"),
            Map.of("en", "butterfly", "ko", "나비"),
            Map.of("en", "person", "ko", "사람"),
            Map.of("en", "flower", "ko", "꽃"),
            Map.of("en", "snail", "ko", "달팽이")
    );
}