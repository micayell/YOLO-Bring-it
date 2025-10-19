package com.yolo.bringit.userservice.controller;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.ResponseDto;
import com.yolo.bringit.userservice.dto.achievement.AchievementResponseDto;
import com.yolo.bringit.userservice.service.achievement.AchievementService;
import com.yolo.bringit.userservice.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/achievements")
public class AchievementController {
    private final AchievementService achievementService;
    private final ResponseHandler responseHandler;

    @GetMapping
    public ResponseEntity<?> getAchievements(@AuthenticationPrincipal Member member) {
        try {
            AchievementResponseDto.AchievementList achievements = achievementService.getAchievements(member);

            if (achievements.getAchievements() == null || achievements.getAchievements().isEmpty()) {
                return responseHandler.fail("업적이 존재하지 않습니다", HttpStatus.NOT_FOUND);
            }

            return responseHandler.success(achievements);
        } catch (Exception e) {
            log.error("업적 조회 중 예외 발생", e);
            return responseHandler.fail("업적 조회 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
//    @PostMapping("/{achievement-id}")
//    public ResponseEntity<?> acquireAchievements(@AuthenticationPrincipal Member member,
//                                                 @PathVariable("achievement-id") Long achievementId) {
//        try {
//            achievementService.acquireAchievements(member, achievementId);
//            return responseHandler.success("업적 획득 완료");
//        } catch (Exception e) {
//            log.error("업적 획득 중 예외 발생", e);
//            return responseHandler.fail("업적 획득 실패", HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }
}
