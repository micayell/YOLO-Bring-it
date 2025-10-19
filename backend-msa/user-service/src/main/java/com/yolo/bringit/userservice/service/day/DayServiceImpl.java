package com.yolo.bringit.userservice.service.day;

import com.yolo.bringit.userservice.domain.day.Day;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.repository.day.DayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DayServiceImpl implements DayService {

    private final DayRepository dayRepository;

    @Override
    @Transactional
    public void checkAttendance(Member member) {
        LocalDate today = LocalDate.now();
        boolean isChecked = dayRepository.existsByMemberAndDate(member, today);
        if (!isChecked) {
            Day day = Day.builder()
                    .member(member)
                    .build();
            dayRepository.save(day);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long getTotalAttendanceCount(Member member) {
        return dayRepository.countByMember(member);
    }

    @Override
    @Transactional(readOnly = true)
    public long getConsecutiveAttendanceCount(Member member) {
        List<LocalDate> attendances = dayRepository.findTop100ByMemberOrderByDateDesc(member)
                .stream()
                .map(Day::getDate)
                .toList();

        LocalDate today = LocalDate.now();
        int dayCnt = 0;
        for (LocalDate date : attendances) {
            if (date.equals(today.minusDays(dayCnt))) {
                dayCnt++;
            } else {
                break;
            }
        }
        return dayCnt;
    }
}

