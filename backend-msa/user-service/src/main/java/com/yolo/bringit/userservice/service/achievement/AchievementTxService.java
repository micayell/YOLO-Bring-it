package com.yolo.bringit.userservice.service.achievement;

import com.yolo.bringit.userservice.domain.achievement.Achievement;
import com.yolo.bringit.userservice.domain.achievement.AchievementMember;
import com.yolo.bringit.userservice.domain.item.Item;
import com.yolo.bringit.userservice.domain.member.ItemMember;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.repository.achievement.AchievementMemberRepository;
import com.yolo.bringit.userservice.repository.achievement.AchievementRepository;
import com.yolo.bringit.userservice.repository.item.ItemRepository;
import com.yolo.bringit.userservice.repository.member.ItemMemberRepository;
import com.yolo.bringit.userservice.service.day.DayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AchievementTxService {
    private final AchievementRepository achievementRepository;
    private final AchievementMemberRepository achievementMemberRepository;
    private final ItemRepository itemRepository;
    private final ItemMemberRepository itemMemberRepository;

    @Transactional
    public boolean acquireAchievements(Member member, Long achievementId) {
        //이미 취득한 업적인지 확인
        boolean alreadyExists = achievementMemberRepository
                .existsByMember_MemberUidAndAchievement_AchievementUid(member.getMemberUid(), achievementId);
        if (alreadyExists) return false;

        // 업적 달성
        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 업적입니다."));

        AchievementMember achievementMember = AchievementMember.builder()
                .achievement(achievement)
                .member(member)
                .build();

        achievementMemberRepository.save(achievementMember);

        // 업적 달성에 따른 보상 아이템 지급
        Item item = itemRepository.findById(achievementId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이템입니다."));

        itemMemberRepository.save(ItemMember.builder()
                .item(item)
                .member(member)
                .build());

        return true;
    }

}
