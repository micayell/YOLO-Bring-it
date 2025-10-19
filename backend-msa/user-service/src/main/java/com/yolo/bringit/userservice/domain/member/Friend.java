package com.yolo.bringit.userservice.domain.member;

import com.yolo.bringit.userservice.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Entity
@Table(name = "friend")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "friendUid", callSuper = false)
public class Friend extends BaseTimeEntity {
    @Id
    @Column(name = "friend_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long friendUid;

    @Comment("친구 요청 발신자")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Member sender;

    @Comment("친구 요청 수신자")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Member receiver;

    @Comment("친구 요청 수락 여부")
    @Column(name = "is_accepted")
    private Boolean isAccepted = false;

    @Builder
    public Friend(Long friendUid, Member sender, Member receiver, Boolean isAccepted) {
        this.friendUid = friendUid;
        this.sender = sender;
        this.receiver = receiver;
        this.isAccepted = isAccepted != null ? isAccepted : false;
    }

    public void setIsAccepted(Boolean accepted) {
        isAccepted = accepted;
    }
}
