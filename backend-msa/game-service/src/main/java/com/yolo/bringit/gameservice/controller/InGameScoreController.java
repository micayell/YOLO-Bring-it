package com.yolo.bringit.gameservice.controller;

import com.yolo.bringit.gameservice.dto.ai.AiResponseDto;
import com.yolo.bringit.gameservice.dto.inGameScore.InGameScoreRequestDto;
import com.yolo.bringit.gameservice.dto.inGameScore.InGameScoreResponseDto;
import com.yolo.bringit.gameservice.service.ai.AiService;
import com.yolo.bringit.gameservice.service.game.InGameScoreService;
import com.yolo.bringit.gameservice.util.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/in-game-scores")
public class InGameScoreController {
    private final InGameScoreService inGameScoreService;
    private final ResponseHandler responseHandler;

    @Operation(summary = "현재 in-game-score 점수 호출", description = "현재까지 누적점수를 호출합니다")
    @PostMapping("/{room-id}/{game-code}")
    public ResponseEntity<?> saveRoundScore(@PathVariable("game-code") Long gameCode,
                                            @PathVariable("room-id") Long roomId,
                                            @RequestParam int score,
                                            @RequestHeader("X-MEMBER-UID") Long userId) {
        try {
//            List<InGameScoreResponseDto.FinalResult> result = inGameScoreService.saveScore(gameCode, roomId, userId, score);
//            return responseHandler.success(result);

            List<InGameScoreResponseDto.FinalResult> result = inGameScoreService.sortScore(gameCode, roomId);
            return responseHandler.success(result);

        } catch (Exception e) {
            return responseHandler.fail("점수 저장 중 오류가 발생했습니다", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "최종 점수 저장", description = "최종 점수 및 정보를 저장합니다")
    @PostMapping("/{room-id}/final")
    public ResponseEntity<?> saveFinalScore(@PathVariable("room-id") Long roomId,
                                            @RequestHeader("X-MEMBER-UID") Long userId) {
        try {
            List<InGameScoreResponseDto.FinalResult> result = inGameScoreService.saveFinalScore(userId, roomId);
            return responseHandler.success(result);
        } catch (Exception e) {
            return responseHandler.fail("최종 점수 저장 중 오류가 발생했습니다",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "yolo score 칭찬 점수", description = "칭찬 점수를 저장합니다")
    @PostMapping("/{member-id}/yolo-up")
    public ResponseEntity<?> saveYoloUp(@PathVariable("member-id") Long memberId,
                                        @RequestBody InGameScoreRequestDto requestDto) {
        try {
            inGameScoreService.saveYoloUp(requestDto.getRoomId(), memberId);
            return responseHandler.success(memberId +"님에게 칭찬 점수!");
        } catch (Exception e) {
            return responseHandler.fail("칭찬 점수 저장 오류가 발생했습니다",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "yolo score 불쾌 점수", description = "불쾌 점수를 저장합니다")
    @PostMapping("/{member-id}/yolo-down")
    public ResponseEntity<?> saveYoloDown(@PathVariable("member-id") Long memberId,
                                          @RequestBody InGameScoreRequestDto requestDto) {
        try {
            inGameScoreService.saveYoloDown(requestDto.getRoomId(), memberId);
            return responseHandler.success(memberId +"님에게 불쾌 점수!");
        } catch (Exception e) {
            return responseHandler.fail("불쾌 점수 저장 오류가 발생했습니다",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private final AiService aiService; // detectObject()가 있는 서비스

    @PostMapping(value = "/detect", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiResponseDto.ObjectDetectionInfo> detect(
            @RequestParam Long roomId,
            @RequestParam Integer roundIdx,
            @RequestParam("image") MultipartFile image, // 파일 직접 수신
            @RequestParam String targetItem,
            @RequestParam Long userId
    ) {
        AiResponseDto.ObjectDetectionInfo result = aiService.detectObject(
                roomId,
                roundIdx,
                image,
                userId,
                targetItem
        );

        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/drawit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiResponseDto.PictureSimilarityInfo> drawit(
            @RequestParam Long roomId,
            @RequestParam Integer roundIdx,
            @RequestParam("image") MultipartFile image, // 파일 직접 수신
            @RequestParam String targetPicture,
            @RequestParam Long userId
    ) {
        AiResponseDto.PictureSimilarityInfo result = aiService.checkPictureSimilarity(
                roomId,
                roundIdx,
                image,
                userId,
                targetPicture
        );

        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/faceit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiResponseDto.FaceAnalysisInfo> faceit(
            @RequestParam Long roomId,
            @RequestParam Integer roundIdx,
            @RequestParam("image") MultipartFile image, // 파일 직접 수신
            @RequestParam String doEmotion,
            @RequestParam Long userId
    ) {
        AiResponseDto.FaceAnalysisInfo result = aiService.analyzeFaceEmotion(
                roomId,
                roundIdx,
                image,
                userId,
                doEmotion
        );

        return ResponseEntity.ok(result);
    }
}
