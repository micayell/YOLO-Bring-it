package com.yolo.bringit.userservice.service.achievement;

import com.yolo.bringit.userservice.domain.achievement.Achievement;
import com.yolo.bringit.userservice.domain.achievement.AchievementMember;
import com.yolo.bringit.userservice.domain.item.Item;
import com.yolo.bringit.userservice.domain.member.ItemMember;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.achievement.AchievementResponseDto;
import com.yolo.bringit.userservice.dto.stomp.StompDto;
import com.yolo.bringit.userservice.repository.achievement.AchievementMemberRepository;
import com.yolo.bringit.userservice.repository.achievement.AchievementRepository;
import com.yolo.bringit.userservice.repository.item.ItemRepository;
import com.yolo.bringit.userservice.repository.member.ItemMemberRepository;
import com.yolo.bringit.userservice.service.day.DayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AchievementServiceImpl implements AchievementService {
    private final AchievementRepository achievementRepository;
    private final AchievementTxService achievementTxService;
    private final AchievementMemberRepository achievementMemberRepository;
    private final ItemMemberRepository itemMemberRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final DayService dayService;

    @Override
    public AchievementResponseDto.AchievementList getAchievements(Member member) {
        Long memberUid = member.getMemberUid();

        // 전체 업적
        List<Achievement> allAchievements = achievementRepository.findAll();

        // 내가 달성한 업적들
        Set<Long> myAchievementIds = achievementMemberRepository.findByMember_MemberUid(memberUid)
                .stream()
                .map(am -> am.getAchievement().getAchievementUid())
                .collect(Collectors.toSet());

        // 플래그 설정
        List<AchievementResponseDto.AchievementInfo> achievementInfos = allAchievements.stream()
                .map(achievement -> AchievementResponseDto.AchievementInfo.builder()
                        .achievement(achievement)
                        .hasAchievement(myAchievementIds.contains(achievement.getAchievementUid()))
                        .build())
                .toList();

        // 달성률 계산
        double rate = allAchievements.isEmpty() ? 0.0 :
                (double) myAchievementIds.size() / allAchievements.size() * 100.0;

        // 결과 반환
        return AchievementResponseDto.AchievementList.builder()
                .achievements(achievementInfos)
                .achievementRate(rate)
                .build();
    }

    @Override
    public void notifyAchievement(Member member, Long achievementId) {
        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new IllegalArgumentException("업적이 존재하지 않습니다."));

        simpMessagingTemplate.convertAndSend(
                "/topic/achievement/" + member.getMemberUid(),
                StompDto.AchievementNotificationDto.builder()
                        .memberId(member.getMemberUid())
                        .achievementId(achievementId)
                        .achievementName(achievement.getName())
                        .achievementExp(achievement.getExp())
                        .build());
    }

    @Override
    public void checkGoldUsageAchievements(Member member) {
        boolean isAchieved = false;
        Long achievementId = null;

        if (10_000 <= member.getUsedCoin() && member.getUsedCoin() < 100_000) {
            isAchieved = true;
            achievementId = 12L;
        } else if (100_000 <= member.getUsedCoin() && member.getUsedCoin() < 1_000_000) {
            isAchieved = true;
            achievementId = 13L;
        }

        if (isAchieved) {
            if (achievementTxService.acquireAchievements(member, achievementId))
                notifyAchievement(member, achievementId);
        }
    }

    @Override
    public void checkItemCollectionAchievements(Member member, Item item) {
        String categoryCode = item.getItemCategory().getCategoryCode();
        List<ItemMember> items = itemMemberRepository.findAllByMemberAndItemCategoryCode(member, categoryCode);

        Long achievementId = null;

        if (items.size() == 10) {
            switch (categoryCode) {
                case "CHA":
                    achievementId = 9L;
                    break;
                case "TIT":
                    achievementId = 10L;
                    break;
                case "BAD":
                    achievementId = 11L;
                    break;
            }
            if (achievementTxService.acquireAchievements(member, achievementId))
                notifyAchievement(member, achievementId);
        }
    }

    @Override
    public void checkTotalAttendanceAchievements(Member member) {
        long total = dayService.getTotalAttendanceCount(member);
        Long achievementId = null;

        if (7 <= total && total < 30) {
            achievementId = 14L;
        } else if (30 <= total && total < 100) {
            achievementId = 15L;
        }

        if (achievementId != null) {
            if (achievementTxService.acquireAchievements(member, achievementId))
                notifyAchievement(member, achievementId);
        }
    }

    @Override
    public void checkConsecutiveAttendanceAchievements(Member member) {
        long consecutive = dayService.getConsecutiveAttendanceCount(member);
        Long achievementId = null;

        if (7 <= consecutive && consecutive < 30) {
            achievementId = 16L;
        } else if (30 <= consecutive && consecutive < 100) {
            achievementId = 17L;
        } else if (100 <= consecutive && consecutive < 1_000) {
            achievementId = 18L;
        }

        if (achievementId != null) {
            if (achievementTxService.acquireAchievements(member, achievementId))
                notifyAchievement(member, achievementId);
        }
    }

}
