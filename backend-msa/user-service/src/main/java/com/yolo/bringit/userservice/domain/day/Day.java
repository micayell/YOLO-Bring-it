package com.yolo.bringit.userservice.domain.day;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yolo.bringit.userservice.domain.BaseTimeEntity;
import com.yolo.bringit.userservice.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.time.LocalDate;


@Getter
@Entity
@Table(name="day")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "dayUid", callSuper=false)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Day extends BaseTimeEntity {
    @Id
    @Column(name="day_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dayUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memberId", nullable = false)
    private Member member;

    @Comment("date")
    @Column(name="date", nullable = false)
    private LocalDate date;

    @Builder
    public Day(Member member) {
        this.member = member;
        this.date = LocalDate.now();
    }
}
