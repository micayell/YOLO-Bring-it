package com.yolo.bringit.userservice.service.day;

import com.yolo.bringit.userservice.domain.member.Member;

public interface DayService {
    /* 출석 처리 */
    void checkAttendance(Member member);
    /* 누적 출석 일수 계산 */
    long getTotalAttendanceCount(Member member);
    /* 연속 출석 일수 계산 */
    long getConsecutiveAttendanceCount(Member member);
}
