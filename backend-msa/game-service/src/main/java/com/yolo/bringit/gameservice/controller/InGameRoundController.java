package com.yolo.bringit.gameservice.controller;

import com.yolo.bringit.gameservice.dto.game.GameResponseDto;
import com.yolo.bringit.gameservice.service.game.GameService;
import com.yolo.bringit.gameservice.service.game.InGameRoundService;
import com.yolo.bringit.gameservice.util.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/in-game-rounds")
public class InGameRoundController {

    private final InGameRoundService inGameRoundService;
    private final GameService gameService;
    private final ResponseHandler responseHandler;

    @Operation(summary = "해당 라운드의 게임 조회", description = "게임을 진행 중인 방에서 해당 라운드에 진행할 게임 정보를 반환합니다.")
    @GetMapping("/{room-id}/{round-idx}")
    public ResponseEntity<?> getGameByRound(@PathVariable("room-id") Long roomId, @PathVariable("round-idx") Integer roundIdx, @RequestHeader("X-MEMBER-UID") Long userId) {
        try {
            // 게임 정보 생성
            GameResponseDto.GameRoundInfo gameInfo = inGameRoundService.getGameByRound(roomId, roundIdx);

            // 도착 수 집계
            int arrived = gameService.markArrived(roomId, roundIdx, userId);
            int totalCnt = gameService.getPlayersNumber(roomId);

            if (arrived >= totalCnt && gameService.acquireStartLock(roomId, roundIdx, 10)) {
                // 키워드 생성
                Map<String, String> keywords = new HashMap<>();
                keywords = switch (gameInfo.getGameCode().toString()) {
                    case "1", "2", "4" -> gameService.getKeyword(gameInfo.getGameCode());
                    case "3" -> gameService.getRGB();
                    default -> keywords;
                };

                // 소켓 발송
                gameService.gameStartSocket(roomId, roundIdx, gameInfo.getGameCode(), keywords);
                gameService.clearArrived(roomId, roundIdx);
            }

            return responseHandler.success(gameInfo);
        } catch (NoSuchElementException e) {
            log.warn("라운드/게임 없음 roomId={}, roundIdx={} : {}", roomId, roundIdx, e.getMessage());
            return responseHandler.fail("라운드/게임이 없습니다.", HttpStatus.NOT_FOUND);

        } catch (org.springframework.data.redis.RedisConnectionFailureException e) {
            log.error("Redis 연결 실패", e);
            return responseHandler.fail("임시 장애: 동기화 저장소 오류", HttpStatus.SERVICE_UNAVAILABLE);

        } catch (Exception e) {
            log.error("게임 불러오기 서버 오류", e);
            return responseHandler.fail("게임 불러오기에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
