package com.yolo.bringit.userservice.domain.achievement;

import com.yolo.bringit.userservice.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name="achievement_member")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "achievementMemberId", callSuper=false)
public class AchievementMember {
    @Id
    @Column(name="achievement_member_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long achievementMemberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achievementId")
    private Achievement achievement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memberId")
    private Member member;

    @Builder
    public AchievementMember(Achievement achievement, Member member) {
        this.achievement = achievement;
        this.member = member;
    }
}
