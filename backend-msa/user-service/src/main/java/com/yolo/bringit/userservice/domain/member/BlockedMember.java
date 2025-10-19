package com.yolo.bringit.userservice.domain.member;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Entity
@Table(name="blocked_member")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "blockedMemberUid", callSuper=false)
public class BlockedMember {

    @Id
    @Column(name="blocked_member_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blockedMemberUid;

    @Comment("차단자 멤버")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="blockerId", nullable = false)
    private Member blocker;

    @Comment("차단 대상 멤버")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="blockedId", nullable = false)
    private Member blocked;

    @Builder
    public BlockedMember(Member blocker, Member blocked) {
        this.blocker = blocker;
        this.blocked = blocked;
    }
}
