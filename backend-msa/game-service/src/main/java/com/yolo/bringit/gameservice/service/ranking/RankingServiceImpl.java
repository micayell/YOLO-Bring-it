package com.yolo.bringit.gameservice.service.ranking;

import com.yolo.bringit.gameservice.client.UserServiceClient;
import com.yolo.bringit.gameservice.domain.ranking.Ranking;
import com.yolo.bringit.gameservice.dto.client.ClientResponseDto;
import com.yolo.bringit.gameservice.dto.ranking.RankingResponseDto;
import com.yolo.bringit.gameservice.repository.ranking.RankingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {
    private final RankingRepository rankingRepository;
    private final UserServiceClient userServiceClient;
    private final CircuitBreakerFactory circuitBreakerFactory;

    @Override
    public RankingResponseDto.GameRankingPage getRankingsByGame(Long gameCode, Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "score"));
        List<Ranking> allRankings = rankingRepository.findByGame_GameCode(gameCode, pageable).getContent();

        // 필요한 memberIds 추출
        Set<Long> memberIds = allRankings.stream()
                .map(Ranking::getMemberId)
                .collect(Collectors.toSet());

        // Feign으로 유저 정보 조회
        CircuitBreaker circuitBreker = circuitBreakerFactory.create("circuitbreaker");
        Map<Long, ClientResponseDto.MemberSimpleInfo> memberInfoMap = circuitBreker.run(() ->
                        userServiceClient.getActiveMemberInfoMap(new ArrayList<>(memberIds)).getData(),
                        throwable -> new HashMap<>());

        // 회원탈퇴한 유저 제외
        List<Ranking> filteredRankings = allRankings.stream()
                .filter(r -> {
                    ClientResponseDto.MemberSimpleInfo info = memberInfoMap.get(r.getMemberId());
                    return info != null && !info.isDeleted(); // 탈퇴 안한 유저만
                })
                .collect(Collectors.toList());

        // 랭킹 계산
        List<RankingResponseDto.GameRanking> pageRankings = new ArrayList<>();
        int rank = 1, count = 1, prevScore = -1, idx = 0;

        for (Ranking r : filteredRankings) {
            int score = r.getScore();
            if (score != prevScore) {
                rank = count;
            }

            if (idx >= page * size && idx < (page + 1) * size) {
                String nickname = memberInfoMap.get(r.getMemberId()).getNickname();
                pageRankings.add(RankingResponseDto.GameRanking.builder()
                        .place(rank)
                        .nickname(nickname)
                        .score(score)
                        .build());
            }

            prevScore = score;
            count++;
            idx++;
        }

        // 내 랭킹 계산
        Ranking myRanking = filteredRankings.stream()
                .filter(r -> r.getMemberId().equals(userId))
                .findFirst()
                .orElse(null);

        RankingResponseDto.GameRanking myRankDto = RankingResponseDto.GameRanking.builder()
                .place(0)
                .nickname(memberInfoMap.getOrDefault(userId, ClientResponseDto.MemberSimpleInfo.builder().build()).getNickname())
                .score(myRanking != null ? myRanking.getScore() : 0)
                .build();

        if (myRanking != null) {
            prevScore = -1;
            rank = 1;
            count = 1;
            for (Ranking r : filteredRankings) {
                int score = r.getScore();
                if (score != prevScore) {
                    rank = count;
                }
                if (r.getMemberId().equals(userId)) {
                    myRankDto.setPlace(rank);
                    break;
                }
                prevScore = score;
                count++;
            }
        }

        return RankingResponseDto.GameRankingPage.builder()
                .myRanking(myRankDto)
                .rankings(pageRankings)
                .hasNext((page + 1) * size < filteredRankings.size())
                .build();
    }


}
