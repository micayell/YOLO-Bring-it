package com.yolo.bringit.gameservice.repository.ranking;

import com.yolo.bringit.gameservice.domain.ranking.Ranking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RankingRepository extends JpaRepository<Ranking, Long> {
    //int countByGame_GameCodeAndMember_IsDeletedFalseAndScoreGreaterThan(Long gameCode, int score);
    //Page<Ranking> findByGame_GameCodeAndMember_IsDeletedFalseOrderByScoreDesc(Long gameCode, Pageable pageable);
    Page<Ranking> findByGame_GameCode(Long gameCode, Pageable pageable);
    List<Ranking> findAllByOrderByScoreDesc();
    Optional<Ranking> findByMemberIdAndGame_GameCode(Long memberId, Long gameCode);
}
