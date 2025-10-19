package com.yolo.bringit.userservice.repository.day;

import com.yolo.bringit.userservice.domain.day.Day;
import com.yolo.bringit.userservice.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DayRepository extends JpaRepository<Day,Long> {
    /* 출석 여부 확인 */
    boolean existsByMemberAndDate(Member member, LocalDate date);
    /* 누적 출석 일수 계산 */
    long countByMember(Member member);
    /* 최근 출석 리스트 조회 */
    List<Day> findTop100ByMemberOrderByDateDesc(Member member);
}

