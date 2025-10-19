package com.yolo.bringit.gameservice.domain.room;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name="room_member")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "roomMemberId", callSuper=false)
public class RoomMember {

    @Id
    @Column(name="room_member_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomMemberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId")
    private Room room;

    @Column(name = "userId")
    private Long userId;

    @Column(name="is_ready")
    private Boolean isReady;

    @Builder
    public RoomMember(Room room, Long userId, Boolean isReady) {
        this.room = room;
        this.userId = userId;
        this.isReady = isReady;
    }

    public void changeIsReady(boolean isReady) {
        this.isReady = isReady;
    }
}
