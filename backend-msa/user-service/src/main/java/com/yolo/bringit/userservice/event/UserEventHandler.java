package com.yolo.bringit.userservice.event;

import com.yolo.bringit.saga.AchievementEarnedEvent;
import com.yolo.bringit.saga.YoloScoreChangedEvent;
import com.yolo.bringit.userservice.domain.achievement.Achievement;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.stomp.StompDto;
import com.yolo.bringit.userservice.repository.achievement.AchievementRepository;
import com.yolo.bringit.userservice.repository.member.MemberRepository;
import com.yolo.bringit.userservice.service.achievement.AchievementService;
import com.yolo.bringit.userservice.service.achievement.AchievementTxService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@Slf4j
@AllArgsConstructor
public class UserEventHandler {
    private final MemberRepository memberRepository;
    private final AchievementRepository achievementRepository;
    private final AchievementService achievementService;
    private final AchievementTxService achievementTxService;

    private final SimpMessagingTemplate simpMessagingTemplate;

    @KafkaListener(topics = "yolo-score-changed", groupId = "user-service-group")
    public void processYoloScoreChanged(YoloScoreChangedEvent event) {
        log.info("Received YoloScoreChangedEvent for user {}.", event.getUserId());

        Optional<Member> optionalMember = memberRepository.findById(event.getUserId());

        if (optionalMember.isPresent()) { // 멤버 존재
            Member member = optionalMember.get();

            if (event.state.equals("up")) {
                member.increaseYoloScore();
            } else if (event.state.equals("down")) {
                member.decreaseYoloScore();
            }

            memberRepository.save(member);
            log.info("Yolo score changed for user {}.", event.getUserId());
        } else {
            log.error("Failed to change Yolo score for user {}.", event.getUserId());
        }
    }

    @KafkaListener(topics = "achievement-earned", groupId = "user-service-group")
    public void processAchievementEarned(AchievementEarnedEvent event) {
        log.info("Received AchievementEarnedEvent(achievement id : {}) for user {}.", event.getAchievementId(), event.getUserId());

        try {
            Member member = memberRepository.findById(event.getUserId())
                    .orElseThrow(() -> new NoSuchElementException("해당 유저를 찾을 수 없습니다: " + event.getUserId()));

            Achievement achievement = achievementRepository.findById(event.getAchievementId())
                    .orElseThrow(() -> new NoSuchElementException("해당 업적을 찾을 수 없습니다: " + event.getAchievementId()));

            achievementTxService.acquireAchievements(member, event.getAchievementId());
            log.info("{} users earned achievement.", event.getUserId());

            simpMessagingTemplate.convertAndSend(
                    "/topic/achievement/" + event.getUserId(),
                    StompDto.AchievementNotificationDto.builder()
                                    .memberId(event.getUserId())
                                    .achievementId(event.getAchievementId())
                            .achievementName(achievement.getName())
                            .achievementExp(achievement.getExp())
                                    .build());
        } catch (Exception e) {
            log.info("{} users failed to earn achievement.", event.getUserId());
        }
    }
}
