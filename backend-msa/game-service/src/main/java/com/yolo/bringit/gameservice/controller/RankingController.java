package com.yolo.bringit.gameservice.controller;

import com.yolo.bringit.gameservice.dto.ranking.RankingResponseDto;
import com.yolo.bringit.gameservice.service.ranking.RankingService;
import com.yolo.bringit.gameservice.util.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/rankings")
public class RankingController {
    private final RankingService rankingService;
    private final ResponseHandler responseHandler;

    @Operation(summary = "게임별 점수", description = "게임별 점수를 제공합니다")
    @GetMapping("/{game-code}")
    public ResponseEntity<?> getRankingByGame(
            @PathVariable("game-code") Long gameCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("X-MEMBER-UID") Long userId) {

        RankingResponseDto.GameRankingPage rankings = rankingService.getRankingsByGame(gameCode, userId, page, size);
        return responseHandler.success(rankings);
    }
}
