package com.yolo.bringit.userservice.repository.achievement;

import com.yolo.bringit.userservice.domain.achievement.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findAll();
}
