package com.yolo.bringit.gameservice.controller;

import com.yolo.bringit.gameservice.service.ai.AiService;
import com.yolo.bringit.gameservice.service.ai.NonAiService;
import com.yolo.bringit.gameservice.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/game-judges")
public class GameJudgeController {

    private final AiService aiService;
    private final NonAiService nonAiService;
    private final ResponseHandler responseHandler;

    @PostMapping("/{room-id}/{round-idx}/{game-code}")
    public ResponseEntity<?> judgeGame(@PathVariable("room-id") Long roomId,
                                       @PathVariable("round-idx") Integer roundIdx,
                                       @PathVariable("game-code") Long gameCode,
                                       @RequestHeader("X-MEMBER-UID") Long userId,
                                       @RequestParam(required = false) String targetItem,
                                       @RequestParam(required = false) String doEmotion,
                                       @RequestParam(required = false) Integer r,
                                       @RequestParam(required = false) Integer g,
                                       @RequestParam(required = false) Integer b,
                                       @RequestParam(required = false) String targetPicture,
                                       @RequestParam(required = false) String language,
                                       @RequestPart(required = false) MultipartFile image,           // 이미지 파일
                                       @RequestPart(required = false) MultipartFile targetAudioPath, // 타겟 오디오 파일
                                       @RequestPart(required = false) MultipartFile userAudioPath    // 사용자 오디오 파일
    ) {
        try {
            switch (gameCode.toString()) {
                case "1": // Bring It!
                    return responseHandler.success(
                            aiService.detectObject(roomId, roundIdx, image, userId, targetItem)
                    );

                case "2": // Face It!
                    return responseHandler.success(
                            aiService.analyzeFaceEmotion(roomId, roundIdx, image, userId, doEmotion)
                    );
//
                case "3": // Color Killer
                    return responseHandler.success(
                            nonAiService.calculateColorScore(roomId, roundIdx, image, userId, r, g, b)
                    );

                case "4": // Draw It!
                    return responseHandler.success(
                            aiService.checkPictureSimilarity(roomId, roundIdx, image, userId, targetPicture)
                    );
////                case "5":
////                    // Blink Battle
//                case "6": // Sound It!
//                    return responseHandler.success(
//                            aiService.checkVoiceSimilarity(roomId, roundIdx,
//                                    targetAudioPath, userAudioPath, userId, language)
//                    );
//                case "7":
//                    // Trap Word
//                case "8":
//                    // Time Sniper
//                case "9":
//                    // The Fastest Finger
//                case "10":
//                    // Head Banging
                default:
                    return responseHandler.fail("해당하는 게임이 없습니다.", HttpStatus.BAD_REQUEST);
            }
        }catch(Exception e){
            log.error("게임 판정 과정 실패", e);
            return responseHandler.fail("게임 판정 과정에서 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
