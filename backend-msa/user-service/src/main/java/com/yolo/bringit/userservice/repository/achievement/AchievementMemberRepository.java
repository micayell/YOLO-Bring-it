package com.yolo.bringit.userservice.repository.achievement;

import com.yolo.bringit.userservice.domain.achievement.AchievementMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AchievementMemberRepository extends JpaRepository<AchievementMember, Long> {
    List<AchievementMember> findByMember_MemberUid(Long memberUid);
    boolean existsByMember_MemberUidAndAchievement_AchievementUid(Long memberUid, Long achievementUid);
}
