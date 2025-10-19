package com.yolo.bringit.userservice.service.achievement;

import com.yolo.bringit.userservice.domain.item.Item;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.achievement.AchievementResponseDto;

public interface AchievementService {
    AchievementResponseDto.AchievementList getAchievements(Member member);

    void notifyAchievement(Member member, Long achievementId);
    void checkGoldUsageAchievements(Member member);
    void checkItemCollectionAchievements(Member member, Item item);
    void checkTotalAttendanceAchievements(Member member);
    void checkConsecutiveAttendanceAchievements(Member member);

}
