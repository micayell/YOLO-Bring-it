package com.yolo.bringit.userservice.dto.achievement;

import com.yolo.bringit.userservice.domain.achievement.Achievement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

public class AchievementResponseDto {
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementInfo {
        private Achievement achievement;
        private boolean hasAchievement;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementList {
        private List<AchievementInfo> achievements;
        private double achievementRate;
    }
}