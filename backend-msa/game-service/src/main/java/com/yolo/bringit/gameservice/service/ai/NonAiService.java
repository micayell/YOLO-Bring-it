package com.yolo.bringit.gameservice.service.ai;

import com.yolo.bringit.gameservice.domain.file.YoloFile;
import com.yolo.bringit.gameservice.domain.game.ColorIt;
import com.yolo.bringit.gameservice.domain.game.GameTime;
import com.yolo.bringit.gameservice.dto.ai.AiResponseDto;
import com.yolo.bringit.gameservice.repository.game.ColorItRepository;
import com.yolo.bringit.gameservice.repository.room.RoomMemberRepository;
import com.yolo.bringit.gameservice.service.game.GameService;
import com.yolo.bringit.gameservice.service.game.GameTimeService;
import com.yolo.bringit.gameservice.service.game.InGameScoreService;
import com.yolo.bringit.gameservice.util.S3UploaderUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.io.IOException;
import javax.imageio.ImageIO;

@Slf4j
@Service
@RequiredArgsConstructor
public class NonAiService {

    private final S3UploaderUtil s3UploaderUtil;
    private final GameService gameService;
    private final GameTimeService gameTimeService;
    private final InGameScoreService inGameScoreService;
    private final ColorItRepository colorItRepository;
    private final RoomMemberRepository roomMemberRepository;

    public AiResponseDto.ColorScoreInfo calculateColorScore(Long roomId, Integer roundIdx, MultipartFile image, Long userId, int r, int g, int b) {
        try {
            // 게임 시간 검증
            GameTime gameTime = gameTimeService.get(roomId, roundIdx);
//            if (gameTime == null) {
//                return builder.error("FAIL: GameTime이 존재하지 않습니다.").build();
//            }
            Long now = System.currentTimeMillis();
//            if (now < gameTime.getStartAt() || now > gameTime.getEndAt()) {
//                return builder.error("FAIL: 제한시간 외 제출입니다.").build();
//            }

            // 이미지 평균 RGB 계산
            BufferedImage bufferedImage;
            try (var is = image.getInputStream()) {
                bufferedImage = ImageIO.read(is);
            }
            if (bufferedImage == null || bufferedImage.getWidth() == 0 || bufferedImage.getHeight() == 0) {
                throw new IllegalArgumentException("유효하지 않은 이미지입니다.");
            }

            int width = bufferedImage.getWidth();
            int height = bufferedImage.getHeight();
            double totalRed = 0, totalGreen = 0, totalBlue = 0;
            int pixelCount = width * height;

            for (int x = 0; x < width; x++) {
                for (int y = 0; y < height; y++) {
                    int rgb = bufferedImage.getRGB(x, y);
                    totalRed += (rgb >> 16) & 0xFF;
                    totalGreen += (rgb >> 8) & 0xFF;
                    totalBlue += rgb & 0xFF;
                }
            }

            int avgRed = (int) (totalRed / pixelCount);
            int avgGreen = (int) (totalGreen / pixelCount);
            int avgBlue = (int) (totalBlue / pixelCount);

            // 유클리드 거리 계산 (유사도 점수)
            double distance = Math.sqrt(Math.pow(r - avgRed, 2) + Math.pow(g - avgGreen, 2) + Math.pow(b - avgBlue, 2));
            double maxDistance = Math.sqrt(3 * 255 * 255); // 최대 거리
            double similarity = 100 * (1 - (distance / maxDistance)); // %로 변환

            // S3 업로드
            YoloFile yoloFile = s3UploaderUtil.uploadFile(image, "image");
            log.info("S3 업로드 성공 (ColorIt): {}", yoloFile.getPath());

            // 게임 결과 저장
            ColorIt colorResult = ColorIt.builder()
                    .key("room:"+roomId+":member:"+userId)
                    .roomId(roomId)
                    .memberId(userId)
                    .result("PASS")
                    .color_score(Math.round(similarity * 100.0) / 100.0)
                    .filePath(yoloFile.getPath())
                    .build();
            colorItRepository.save(colorResult);
            gameService.gameRoundPassSocket(roomId, roundIdx, 3L, userId, "PASS"); // 결과 소켓

            // 스코어링
            long totalMembers = roomMemberRepository.countByRoom_RoomUid(roomId);
            long submittedMembers = colorItRepository.findByRoomId(roomId).size();
            if (submittedMembers == totalMembers) {
                gameService.finishRound(roomId, roundIdx, 3L);
            }

            return AiResponseDto.ColorScoreInfo.builder()
                    .userId(userId)
                    .result("PASS")
                    .colorScore(Math.round(similarity * 100.0) / 100.0) // 소수점 2자리
                    .error(null)
                    .build();
        } catch (IOException | IllegalArgumentException e) {
            gameService.gameRoundPassSocket(roomId, roundIdx, 3L, userId, "FAIL"); // 결과 소켓
            return AiResponseDto.ColorScoreInfo.builder()
                    .userId(userId)
                    .result("FAIL")
                    .colorScore(0.0) // 소수점 2자리
                    .error("이미지 처리 오류: " + e.getMessage())
                    .build();
        }
    }

}