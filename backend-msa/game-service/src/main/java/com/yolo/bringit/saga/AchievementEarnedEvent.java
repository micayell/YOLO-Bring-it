package com.yolo.bringit.saga;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementEarnedEvent {
    private Long userId;
    private Long achievementId;
}
