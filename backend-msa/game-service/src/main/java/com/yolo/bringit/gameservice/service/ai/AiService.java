package com.yolo.bringit.gameservice.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yolo.bringit.gameservice.client.AiClient;
import com.yolo.bringit.gameservice.domain.game.BringIt;
import com.yolo.bringit.gameservice.domain.game.DrawIt;
import com.yolo.bringit.gameservice.domain.game.FaceIt;
import com.yolo.bringit.gameservice.domain.game.GameTime;
import com.yolo.bringit.gameservice.dto.ai.AiResponseDto;
import com.yolo.bringit.gameservice.repository.game.BringItRepository;
import com.yolo.bringit.gameservice.repository.game.DrawItRepository;
import com.yolo.bringit.gameservice.repository.game.FaceItRepository;
import com.yolo.bringit.gameservice.repository.room.RoomMemberRepository;
import com.yolo.bringit.gameservice.service.game.GameService;
import com.yolo.bringit.gameservice.service.game.GameTimeService;
import com.yolo.bringit.gameservice.service.game.InGameScoreService;
import com.yolo.bringit.gameservice.domain.file.YoloFile;
import com.yolo.bringit.gameservice.util.S3UploaderUtil;
import face_analysis.FaceAnalysis;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import object_detect.ObjectDetection;
import picture_similar.PictureSimilar;
import voice_grade.VoiceGrade;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import picture_similar.PictureSimilar;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final AiClient aiClient;
    private final S3UploaderUtil s3UploaderUtil;
    private final ObjectMapper objectMapper;
    private final BringItRepository bringItRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final InGameScoreService inGameScoreService;
    private final GameTimeService gameTimeService;
    private final DrawItRepository drawItRepository;
    private final GameService gameService;
    private final FaceItRepository faceItRepository;

    public AiResponseDto.ObjectDetectionInfo detectObject(
            Long roomId, Integer roundIdx, MultipartFile image, Long userId, String targetItem
    ) {
        try {
            ObjectDetection.DetectResponse response = aiClient.detectObject(image, targetItem);
            Map<String, Object> status = objectMapper.readValue(response.getStatus(), Map.class);
            String result = (String) status.get("result");
            String error = (String) status.get("error");

            AiResponseDto.ObjectDetectionInfo.ObjectDetectionInfoBuilder builder = AiResponseDto.ObjectDetectionInfo.builder()
                    .userId(userId)
                    .result(result)
                    .error(error);

            if (!"PASS".equalsIgnoreCase(result)) {
                gameService.gameRoundPassSocket(roomId, roundIdx, 1L, userId, "FAIL"); // 결과 소켓
                return builder.error("FAIL: 실패 처리된 이미지입니다.").build();
            }

            // 게임 시간 검증
            GameTime gameTime = gameTimeService.get(roomId, roundIdx);
//            if (gameTime == null) {
//                return builder.error("FAIL: GameTime이 존재하지 않습니다.").build();
//            }

            Long now = System.currentTimeMillis();
//            if (now < gameTime.getStartAt() || now > gameTime.getEndAt()) {
//                return builder.error("FAIL: 제한시간 외 제출입니다.").build();
//            }

            // S3 업로드
            YoloFile yoloFile = s3UploaderUtil.uploadFile(image, "image");
            log.info("S3 업로드 성공 (BringIt): {}", yoloFile.getPath());

            // 게임 결과 저장
            BringIt detectionResult = BringIt.builder()
                    .key("room:" + roomId + ":member:" + userId)
                    .roomId(roomId)
                    .memberId(userId)
                    .result(result)
                    .timestamp(LocalDateTime.now())
                    .filePath(yoloFile.getPath())
                    .build();
            bringItRepository.save(detectionResult);
            gameService.gameRoundPassSocket(roomId, roundIdx, 1L, userId, result); // 결과 소켓

            // 스코어링
            long totalMembers = roomMemberRepository.countByRoom_RoomUid(roomId);
            long submittedMembers = bringItRepository.findByRoomId(roomId).size();
            if (submittedMembers == totalMembers) {
                gameService.finishRound(roomId, roundIdx, 1L);
            }

            // TODO: 스케줄링으로 timeout 시 BringitprocessScoring 호출
            return builder.build();
        } catch (Exception e) {
            log.error("Object detection error: {}", e.getMessage());
            gameService.gameRoundPassSocket(roomId, roundIdx, 1L, userId, "FAIL");
            return AiResponseDto.ObjectDetectionInfo.builder()
                    .userId(userId)
                    .result("FAIL")
                    .error("gRPC 호출 또는 S3 업로드 실패: " + e.getMessage())
                    .build();
        }
    }

    public AiResponseDto.FaceAnalysisInfo analyzeFaceEmotion(Long roomId, Integer roundIdx, MultipartFile image, Long userId, String doEmotion) {
        try {
            FaceAnalysis.AnalyzeEmotionResponse response = aiClient.analyzeFaceEmotion(image, doEmotion);
            Map<String, Object> status = objectMapper.readValue(response.getStatus(), Map.class);

            String resultObj = status.get("result") != null ? status.get("result").toString() : null;
            String topEmotionsStr = status.get("top_emotions") != null ? status.get("top_emotions").toString() : null;
            String error = status.get("error") != null ? String.valueOf(status.get("error")) : null;

            List<String> topEmotionList = (topEmotionsStr == null || topEmotionsStr.isEmpty())
                    ? List.of()
                    : Arrays.stream(topEmotionsStr
                            .replace("[", "")
                            .replace("]", "")
                            .split(","))
                    .map(String::trim)
                    .collect(Collectors.toList());

            AiResponseDto.FaceAnalysisInfo.FaceAnalysisInfoBuilder builder =
                    AiResponseDto.FaceAnalysisInfo.builder()
                            .userId(userId)
                            .result(resultObj)
                            .topEmotions(topEmotionList)
                            .error(error);

            // PASS 검증
            if (!"PASS".equalsIgnoreCase(resultObj)) {
                gameService.gameRoundPassSocket(roomId, roundIdx, 2L, userId, "FAIL");
                return builder.error("FAIL: 실패 처리된 이미지입니다.").build();
            }

            // 게임 시간 검증
            GameTime gameTime = gameTimeService.get(roomId, roundIdx);
//        if (gameTime == null) {
//            return builder.error("FAIL: GameTime이 존재하지 않습니다.").build();
//        }
//
//        long now = System.currentTimeMillis();
//        if (now < gameTime.getStartAt() || now > gameTime.getEndAt()) {
//            return builder.error("FAIL: 제한시간 외 제출입니다.").build();
//        }

            // S3 업로드
            YoloFile yoloFile = s3UploaderUtil.uploadFile(image, "image");
            log.info("S3 업로드 성공 (FaceIt): {}", yoloFile.getPath());

            // 결과 저장
            FaceIt faceResult = FaceIt.builder()
                    .key("room:" + roomId + ":member:" + userId)
                    .roomId(roomId)
                    .memberId(userId)
                    .result(resultObj)
                    .topEmotions(String.join(",", topEmotionList))
                    .timestamp(LocalDateTime.now())
                    .filePath(yoloFile.getPath())
                    .build();
            faceItRepository.save(faceResult);
            gameService.gameRoundPassSocket(roomId, roundIdx, 2L, userId, resultObj);

            // 6. 모든 멤버 제출 시 처리
            long totalMembers = roomMemberRepository.countByRoom_RoomUid(roomId);
            long submittedMembers = faceItRepository.findByRoomId(roomId).size();
            if (submittedMembers == totalMembers) {
                gameService.finishRound(roomId, roundIdx, 2L);
            }

            return builder.build();

        } catch (Exception e) {
            log.error("analyze face emotion error: {}", e.getMessage());
            gameService.gameRoundPassSocket(roomId, roundIdx, 2L, userId, "FAIL");
            return AiResponseDto.FaceAnalysisInfo.builder()
                    .userId(userId)
                    .result("FAIL")
                    .error("gRPC 호출 또는 S3 업로드 실패: " + e.getMessage())
                    .build();
        }
    }


    public AiResponseDto.PictureSimilarityInfo checkPictureSimilarity(Long roomId, Integer roundIdx, MultipartFile image, Long userId, String targetPicture) {
        try {
            PictureSimilar.CheckSimilarityResponse response = aiClient.checkSimilarity(image, targetPicture);
            Map<String, Object> status = objectMapper.readValue(response.getStatus(), Map.class);

            String resultObj = status.get("result").toString();
            String percentObj = status.get("similarity_percent").toString();
            String error      = status.get("error") != null ? String.valueOf(status.get("error")) : null;


            AiResponseDto.PictureSimilarityInfo.PictureSimilarityInfoBuilder builder =
                    AiResponseDto.PictureSimilarityInfo.builder()
                            .userId(userId)
                            .result(resultObj)
                            .similarityPercent(percentObj)
                            .error(error);

            if (!"PASS".equalsIgnoreCase(resultObj)) {
                gameService.gameRoundPassSocket(roomId, roundIdx, 4L, userId, "FAIL"); // 결과 소켓
                return builder.error("FAIL: 실패 처리된 이미지입니다.").build();
            }

            GameTime gameTime = gameTimeService.get(roomId, roundIdx);
//            if (gameTime == null) {
//                return builder.error("FAIL: GameTime이 존재하지 않습니다.").build();
//            }

            Long now = System.currentTimeMillis();
//            if (now < gameTime.getStartAt() || now > gameTime.getEndAt()) {
//                return builder.error("FAIL: 제한시간 외 제출입니다.").build();
//            }

            YoloFile yoloFile = s3UploaderUtil.uploadFile(image, "image");
            log.info("S3 업로드 성공 (DrawIt): {}", yoloFile.getPath());

            DrawIt drawResult = DrawIt.builder()
                    .key("room:" + roomId + ":member:" + userId)
                    .roomId(roomId)
                    .memberId(userId)
                    .result(resultObj)
                    .similarity_percent(percentObj)
                    .timestamp(LocalDateTime.now())
                    .filePath(yoloFile.getPath())
                    .build();
            drawItRepository.save(drawResult);
            gameService.gameRoundPassSocket(roomId, roundIdx, 4L, userId, resultObj); // 결과 소켓

            long totalMembers = roomMemberRepository.countByRoom_RoomUid(roomId);
            long submittedMembers = drawItRepository.findByRoomId(roomId).size();
            if (submittedMembers == totalMembers) {
                gameService.finishRound(roomId, roundIdx, 4L);
            }

            // TODO: 스케줄링으로 timeout 시 DrawitprocessScoring 호출
            return builder.build();
        } catch (Exception e) {
            log.error("check picture similar error: {}", e.getMessage());
            gameService.gameRoundPassSocket(roomId, roundIdx, 4L, userId, "FAIL");
            return AiResponseDto.PictureSimilarityInfo.builder()
                    .userId(userId)
                    .result("FAIL")
                    .error("gRPC 호출 또는 S3 업로드 실패: " + e.getMessage())
                    .build();
        }
    }

    /*

    public AiResponseDto.VoiceGradeInfo checkVoiceSimilarity(Long roomId, Integer roundIdx, String targetAudioPath, String userAudioPath, Long userId, String language) {
        try {
            VoiceGrade.CheckSimilarityResponse response = aiClient.checkVoiceSimilarity(targetAudioPath, userAudioPath, language);

            JsonObject status = JsonParser.parseString(response.getStatus()).getAsJsonObject();
            JsonObject result = status.getAsJsonObject("result");
            JsonObject targetText = status.getAsJsonObject("target_text");
            JsonObject userText = status.getAsJsonObject("user_text");
            JsonElement textScorePercent = status.get("text_score_percent");
            JsonElement audioScorePercent = status.getAsJsonObject("audio_score_percent");
            JsonElement overallScorePercent = status.getAsJsonObject("overall_score_percent");

            return AiResponseDto.VoiceGradeInfo.builder()
                    .userId(userId)
                    .result(result == null ? null : result.toString())
                    .targetText(targetText == null ? null : targetText.toString())
                    .userText(userText == null ? null : userText.toString())
                    .textScorePercent(textScorePercent == null ? null : textScorePercent.getAsDouble())
                    .audioScorePercent(audioScorePercent == null ? null : audioScorePercent.getAsDouble())
                    .overallScorePercent(overallScorePercent == null ? null : overallScorePercent.getAsDouble())
                    .build();
        } catch (Exception e) {
            return AiResponseDto.VoiceGradeInfo.builder()
                    .userId(userId)
                    .error("Error in voice similarity: " + e.getMessage())
                    .build();
        }
    }

 */
}