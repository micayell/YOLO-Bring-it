package com.yolo.bringit.gameservice.service.game;

import com.yolo.bringit.gameservice.client.UserServiceClient;
import com.yolo.bringit.gameservice.domain.game.BringIt;
import com.yolo.bringit.gameservice.domain.game.ColorIt;
import com.yolo.bringit.gameservice.domain.game.DrawIt;
import com.yolo.bringit.gameservice.domain.game.FaceIt;
import com.yolo.bringit.gameservice.domain.game.InGameScore;
import com.yolo.bringit.gameservice.domain.ranking.Ranking;
import com.yolo.bringit.gameservice.domain.room.Room;
import com.yolo.bringit.gameservice.dto.client.ClientResponseDto;
import com.yolo.bringit.gameservice.dto.inGameScore.InGameScoreResponseDto;
import com.yolo.bringit.gameservice.repository.game.*;
import com.yolo.bringit.gameservice.repository.ranking.RankingRepository;
import com.yolo.bringit.gameservice.repository.room.RoomMemberRepository;
import com.yolo.bringit.gameservice.repository.room.RoomRepository;
import com.yolo.bringit.gameservice.service.producer.EventProducer;
import com.yolo.bringit.saga.AchievementEarnedEvent;
import com.yolo.bringit.saga.YoloScoreChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InGameScoreServiceImpl implements InGameScoreService {
    private final InGameScoreRepository ingameScoreRepository;
    private final RoomRepository roomRepository;

    private final EventProducer eventProducer;
    private final UserServiceClient userServiceClient;
    private final GameRepository gameRepository;
    private final RankingRepository rankingRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final CircuitBreakerFactory circuitBreakerFactory;
    private final BringItRepository bringItRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final FaceItRepository faceItRepository;
    private final ColorItRepository colorItRepository;
    private final DrawItRepository drawItRepository;

    @Override
    public void saveScore(Long gameCode, Long roomId, Long memberId, int score) {
        Room room = roomRepository.findByRoomUidAndIsJoinableFalse(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));

        String key = "room:" + roomId + ":member:" + memberId;
        InGameScore inGameScore = ingameScoreRepository.findById(key).orElse(
                InGameScore.builder()
                        .key(key)
                        .roomId(roomId)
                        .memberId(memberId)
                        .gameScores(new HashMap<>())
                        .totalScore(0)
                        .build()
        );

        Map<Long, Integer> gameScores = inGameScore.getGameScores();
        int currentGameScore = gameScores.getOrDefault(gameCode, 0);
        int newGameScore = currentGameScore + score;
        gameScores.put(gameCode, newGameScore);
        int newTotalScore = gameScores.values().stream().mapToInt(Integer::intValue).sum();

        inGameScore.changeGameScores(gameScores);
        inGameScore.changeTotalScore(newTotalScore);

        ingameScoreRepository.save(inGameScore);
    }

    @Override
    public List<InGameScoreResponseDto.FinalResult> sortScore(Long gameCode, Long roomId) {
        Room room = roomRepository.findByRoomUidAndIsJoinableFalse(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));

        List<InGameScore> livescores = getAllScoresByRoomId(roomId);
        livescores.sort((a, b) -> Integer.compare(b.getTotalScore(), a.getTotalScore()));

        List<InGameScoreResponseDto.FinalResult> result = new ArrayList<>();
        int prevScore = -1;
        int currentRank = 0;

        for (int i = 0; i < livescores.size(); i++) {
            InGameScore livescore = livescores.get(i);
            int totalScore = livescore.getTotalScore();

            if (totalScore != prevScore) {
                currentRank = i + 1;
            }
            prevScore = totalScore;

            CircuitBreaker circuitBreaker = circuitBreakerFactory.create("circuitbreaker");
            ClientResponseDto.MemberInfo info = circuitBreaker.run(() ->
                            userServiceClient.getMember(livescore.getMemberId()).getData(),
                    throwable -> ClientResponseDto.MemberInfo.builder().build()
            );


            // 결과 리스트에 추가
            result.add(InGameScoreResponseDto.FinalResult.builder()
                    .memberId(info.getMemberUid())
                    .nickname(info.getNickname())
                    .rank(currentRank)
                    .totalScore(totalScore)
                    .build());
        }

        return result;
    }

    @Transactional
    @Override
    public List<InGameScoreResponseDto.FinalResult> saveFinalScore(Long userId, Long roomId) {
        Room room = roomRepository.findByRoomUidAndIsJoinableFalse(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));

        if ("custom".equalsIgnoreCase(room.getRoomType())) {
            log.info("사용자 설정 방이므로 최종 점수를 저장하지 않습니다.");
            return Collections.emptyList();
        }

        List<InGameScore> scores = getAllScoresByRoomId(roomId);
        scores.sort((a, b) -> Integer.compare(b.getTotalScore(), a.getTotalScore()));

        int prevScore = -1;
        int currentRank = 0;

        boolean isCurrentMemberUpdated = false;

        List<Map<String, Object>> list = new ArrayList<>();
        for (int i = 0; i < scores.size(); i++) {
            InGameScore score = scores.get(i);
            int totalScore = score.getTotalScore();

            if (totalScore != prevScore) {
                currentRank = i + 1;
            }
            prevScore = totalScore;

            int finalScore = getScoreByRank(currentRank);
            int finalXp = getXpByRank(currentRank);
            int finalCoin = getCoinByRank(currentRank);


            HashMap<String, Object> finalScoreMap = new HashMap<>();

            finalScoreMap.put("userId", score.getMemberId());
            finalScoreMap.put("finalScore", finalScore);
            finalScoreMap.put("finalXp", finalXp);
            finalScoreMap.put("finalCoin", finalCoin);
            finalScoreMap.put("currentRank", currentRank);
            finalScoreMap.put("totalScore", totalScore);

            list.add(finalScoreMap);

            if (score.getMemberId().equals(userId)) {
                isCurrentMemberUpdated = true;
            }

            for (Map.Entry<Long, Integer> entry : score.getGameScores().entrySet()) {
                Long gameCode = entry.getKey();
                Integer gameScore = entry.getValue();
                upsertRankingScore(score.getMemberId(), gameCode, gameScore);
            }
        }

        // feign api call
        CircuitBreaker circuitBreker = circuitBreakerFactory.create("circuitbreaker");
        List<ClientResponseDto.ScoreInfo> scoreInfos = circuitBreker.run(() -> userServiceClient.bulkUpdateScore(list).getData(),
                throwable -> new ArrayList<>());

        if (isCurrentMemberUpdated) { // current member가 업데이트 됨
            ClientResponseDto.ScoreInfo currentMemberScoreInfo = scoreInfos.stream()
                    .filter(i -> i.getUserId().equals(userId)).findFirst().get();

            // 업적: 10회 플레이
            if (currentMemberScoreInfo.getPlayCnt() == 10) {
                eventProducer.publishAchievementEarned(AchievementEarnedEvent.builder()
                        .userId(userId)
                        .achievementId(1L)
                        .build());
            }

            // 업적: 100회 플레이
            if (currentMemberScoreInfo.getPlayCnt() == 100) {
                eventProducer.publishAchievementEarned(AchievementEarnedEvent.builder()
                        .userId(userId)
                        .achievementId(2L)
                        .build());
            }

            // 업적: 1등 10회
            if (currentMemberScoreInfo.getFirstWinCnt() == 10) {
                eventProducer.publishAchievementEarned(AchievementEarnedEvent.builder()
                        .userId(userId)
                        .achievementId(3L)
                        .build());
            }

            // 업적: 1등 50회
            if (currentMemberScoreInfo.getFirstWinCnt() == 50) {
                eventProducer.publishAchievementEarned(AchievementEarnedEvent.builder()
                        .userId(userId)
                        .achievementId(4L)
                        .build());
            }

            // 업적: 2등 10회
            if (currentMemberScoreInfo.getSecondWinCnt() == 10) {
                eventProducer.publishAchievementEarned(AchievementEarnedEvent.builder()
                        .userId(userId)
                        .achievementId(5L)
                        .build());
            }

            // 업적: 2등 50회
            if (currentMemberScoreInfo.getSecondWinCnt() == 50) {
                eventProducer.publishAchievementEarned(AchievementEarnedEvent.builder()
                        .userId(userId)
                        .achievementId(6L)
                        .build());
            }

            // 업적: 3등 10회
            if (currentMemberScoreInfo.getThirdWinCnt() == 10) {
                eventProducer.publishAchievementEarned(AchievementEarnedEvent.builder()
                        .userId(userId)
                        .achievementId(7L)
                        .build());
            }

            // 업적: 3등 50회
            if (currentMemberScoreInfo.getThirdWinCnt() == 50) {
                eventProducer.publishAchievementEarned(AchievementEarnedEvent.builder()
                        .userId(userId)
                        .achievementId(8L)
                        .build());
            }

        }

        List<InGameScoreResponseDto.FinalResult> result = scoreInfos.stream().map(s -> InGameScoreResponseDto.FinalResult.builder()
                .memberId(s.getUserId())
                .totalScore(s.getTotalScore())
                .nickname(s.getNickname())
                .rank(s.getRank())
                .build()).collect(Collectors.toList());

        // room scores를 지우지 않도록 수정
        // deleteRoomScores(roomId);
        return result;
    }

    @Transactional
    public void upsertRankingScore(Long memberId, Long gameCode, int scoreToAdd) {
        Ranking ranking = rankingRepository
                .findByMemberIdAndGame_GameCode(memberId, gameCode)
                .orElseGet(() -> Ranking.create(
                        gameRepository.getReferenceById(gameCode), memberId, 0
                ));

        ranking.addScore(scoreToAdd);
        rankingRepository.save(ranking);
    }

    private List<InGameScore> getAllScoresByRoomId(Long roomId) {
        List<InGameScore> result = new ArrayList<>();
        Iterable<InGameScore> all;

        try {
            all = ingameScoreRepository.findAll();
        } catch (Exception e) {
            log.error("InGameScore 전체 조회 실패: roomId={}", roomId, e);
            return result;
        }

        for (InGameScore score : all) {

            if (score == null) {
                log.warn("null InGameScore을 발견했습니다. 무시합니다.: roomId={}", roomId);
                continue;
            }

            String key = score.getKey();
            if (key == null) {
                log.warn("key가 null인 InGameScore을 발견했습니다. 무시합니다.: roomId={}", roomId);
                continue;
            }
            if (!key.startsWith("room:" + roomId + ":")) {
                continue;
            }

            Map<Long, Integer> gameScores = score.getGameScores();
            if (gameScores == null) {
                log.warn("gameScore이 null인 경우 빈 Map으로 보정합니다. key={}", key);
                gameScores = new HashMap<>();
                score.changeGameScores(gameScores);
            }

            Integer total = score.getTotalScore();
            if (total == null) {
                int computed = gameScores.values().stream()
                        .filter(Objects::nonNull)
                        .mapToInt(Integer::intValue)
                        .sum();
                score.changeTotalScore(computed);
                total = computed;

                try {
                    ingameScoreRepository.save(score);
                } catch (Exception e) {
                    log.debug("totalScore 보정값 저장 실패: key={}. total={}", key, total);
                }
            }

            result.add(score);
        }

        return result;
    }


    private int getScoreByRank(int rank) {
        return switch (rank) {
            case 1 -> 20;
            case 2 -> 15;
            case 3 -> 10;
            default -> 0;
        };
    }

    private int getXpByRank(int rank) {
        return switch (rank) {
            case 1 -> 20;
            case 2 -> 15;
            case 3 -> 10;
            default -> 0;
        };
    }

    private int getCoinByRank(int rank) {
        return switch (rank) {
            case 1 -> 400;
            case 2 -> 300;
            case 3 -> 200;
            default -> 100;
        };
    }

    private void deleteRoomScores(Long roomId) {
        Iterable<InGameScore> all = ingameScoreRepository.findAll();
        List<String> toDelete = new ArrayList<>();

        for (InGameScore score : all) {
            if (score.getKey().startsWith("room:" + roomId + ":")) {
                toDelete.add(score.getKey());
            }
        }

        ingameScoreRepository.deleteAllById(toDelete);
    }

    @Override
    public void saveYoloUp(Long roomId, Long memberId) {
        boolean exists = roomMemberRepository.existsByRoom_RoomUidAndUserId(roomId, memberId);
        if (!exists) {
            throw new IllegalArgumentException("해당 방에 참가한 유저가 아닙니다.");
        }

        YoloScoreChangedEvent event = YoloScoreChangedEvent.builder()
                .userId(memberId)
                .state("up")
                .build();

        // 이벤트 발행
        eventProducer.publishYoloScoreChange(event);
    }

    @Override
    public void saveYoloDown(Long roomId, Long memberId) {
        boolean exists = roomMemberRepository.existsByRoom_RoomUidAndUserId(roomId, memberId);
        if (!exists) {
            throw new IllegalArgumentException("해당 방에 참가한 유저가 아닙니다.");
        }

        YoloScoreChangedEvent event = YoloScoreChangedEvent.builder()
                .userId(memberId)
                .state("down")
                .build();

        // 이벤트 발행
        eventProducer.publishYoloScoreChange(event);
    }

    /* --- 게임 별 점수 산정 메서드 --- */
    @Override
    public void BringitprocessScoring(Long roomId) {
        List<BringIt> results = bringItRepository.findByRoomId(roomId);

        if(!results.isEmpty()) {
            // 빠른 제출 순으로 정렬
            results.sort((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()));

            List<InGameScoreResponseDto.BringItScoreResult> scoreResults = new ArrayList<>();

            for (int i = 0; i < results.size(); i++) {
                int score = switch (i) {
                    case 0 -> 15;
                    case 1 -> 10;
                    case 2 -> 5;
                    default -> 0;
                };

                saveScore(1L, roomId, results.get(i).getMemberId(), score);

                scoreResults.add(InGameScoreResponseDto.BringItScoreResult.builder()
                        .memberId(results.get(i).getMemberId())
                        .score(score)
                        .filePath(results.get(i).getFilePath())
                        .build());
            }

            sortScore(1L, roomId);

            simpMessagingTemplate.convertAndSend(
                    "/topic/room/" + roomId + "/score",  // 구독 경로 예시
                    scoreResults
            );

            // 점수 계산 후 Redis 데이터 삭제
            results.forEach(r -> bringItRepository.deleteById(r.getKey()));
        }
    }

    @Override
    public void FaceitprocessScoring(Long roomId) {
        List<FaceIt> results = faceItRepository.findByRoomId(roomId);

        if(!results.isEmpty()) {
            // 높은 정확도 순으로 정렬
            results.sort(
                    Comparator
                            .comparingDouble((FaceIt r) -> extractPercent(r.getTopEmotions()))
                            .reversed()
                            .thenComparing(FaceIt::getTimestamp) // timestamp가 있다면
            );

            List<InGameScoreResponseDto.FaceItScoreResult> scoreResults = new ArrayList<>();

            for (int i = 0; i < results.size(); i++) {
                int score = switch (i) {
                    case 0 -> 15;
                    case 1 -> 10;
                    case 2 -> 5;
                    default -> 0;
                };

                saveScore(2L, roomId, results.get(i).getMemberId(), score);

                scoreResults.add(InGameScoreResponseDto.FaceItScoreResult.builder()
                        .memberId(results.get(i).getMemberId())
                        .topEmotions(results.get(i).getTopEmotions())
                        .score(score)
                        .filePath(results.get(i).getFilePath())
                        .build());
            }

            sortScore(2L, roomId);

            simpMessagingTemplate.convertAndSend(
                    "/topic/room/" + roomId + "/score",  // 구독 경로 예시
                    scoreResults
            );

            // 점수 계산 후 Redis 데이터 삭제
            results.forEach(r -> faceItRepository.deleteById(r.getKey()));
        }
    }

    @Override
    public void ColoritprocessScoring(Long roomId) {
        List<ColorIt> results = colorItRepository.findByRoomId(roomId);

        if(!results.isEmpty()) {
            results.sort((a, b) -> b.getColor_score().compareTo(a.getColor_score()));

            List<InGameScoreResponseDto.ColorItScoreResult> scoreResults = new ArrayList<>();

            for (int i = 0; i < results.size(); i++) {
                int score = switch (i) {
                    case 0 -> 15;
                    case 1 -> 10;
                    case 2 -> 5;
                    default -> 0;
                };

                saveScore(3L, roomId, results.get(i).getMemberId(), score);

                scoreResults.add(InGameScoreResponseDto.ColorItScoreResult.builder()
                        .memberId(results.get(i).getMemberId())
                        .colorScore(results.get(i).getColor_score().toString())
                        .score(score)
                        .filePath(results.get(i).getFilePath())
                        .build());
            }

            sortScore(3L, roomId);

            simpMessagingTemplate.convertAndSend(
                    "/topic/room/" + roomId + "/score",
                    scoreResults
            );

            // 점수 계산 후 Redis 데이터 삭제
            results.forEach(r -> colorItRepository.deleteById(r.getKey()));
        }
    }

    @Override
    public void DrawitprocessScoring(Long roomId) {
        List<DrawIt> results = drawItRepository.findByRoomId(roomId);
        if(!results.isEmpty()) {
            // 높은 정확도 순으로 정렬
            results.sort(
                    Comparator
                            .comparingDouble((DrawIt d) -> extractPercent(d.getSimilarity_percent()))
                            .reversed()
                            .thenComparing(DrawIt::getTimestamp) // timestamp가 있다면
            );

            List<InGameScoreResponseDto.DrawItScoreResult> scoreResults = new ArrayList<>();

            for (int i = 0; i < results.size(); i++) {
                int score = switch (i) {
                    case 0 -> 15;
                    case 1 -> 10;
                    case 2 -> 5;
                    default -> 0;
                };

                saveScore(4L, roomId, results.get(i).getMemberId(), score);

                scoreResults.add(InGameScoreResponseDto.DrawItScoreResult.builder()
                        .memberId(results.get(i).getMemberId())
                        .similarityPercent(results.get(i).getSimilarity_percent())
                        .score(score)
                        .filePath(results.get(i).getFilePath())
                        .build());
            }

            sortScore(4L, roomId);

            simpMessagingTemplate.convertAndSend(
                    "/topic/room/" + roomId + "/score",  // 구독 경로 예시
                    scoreResults
            );

            // 점수 계산 후 Redis 데이터 삭제
            results.forEach(r -> drawItRepository.deleteById(r.getKey()));
        }
    }

    /* --- 계산 메서드 --- */
    private static double extractPercent(String topEmotions) {
        if (topEmotions == null || topEmotions.isBlank()) return 0.0;

        // 첫 번째 항목만 사용: "happy:100.00%" 또는 "happy:87.12%,sad:10.02%"
        String first = topEmotions.split(",")[0].trim();
        int idx = first.lastIndexOf(':');
        if (idx < 0) return 0.0;

        String pct = first.substring(idx + 1).replace("%", "").trim();
        try {
            return Double.parseDouble(pct);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
