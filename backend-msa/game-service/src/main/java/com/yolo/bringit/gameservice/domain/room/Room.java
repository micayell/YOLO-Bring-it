package com.yolo.bringit.gameservice.domain.room;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yolo.bringit.gameservice.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Entity
@Table(name="room")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "roomUid", callSuper=false)
@ToString(of={"roomUid", "isJoinable"})
public class Room extends BaseTimeEntity {

    @Id
    @Column(name="room_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomUid;

    @Comment("참여 가능 여부")
    @Column(name="is_joinable", nullable = false)
    private Boolean isJoinable;

    @Comment("회원 ID")
    @Column(name = "manager_id", nullable = true)
    private Long managerId;

    @Comment("라운드 수")
    @Column(name="round_num", nullable = false)
    private Integer roundNum;

    @Comment("방 타입")
    @Column(name="room_type", nullable = false)
    private String roomType;

    @Builder
    public Room(Boolean isJoinable, Long managerId, Integer roundNum, String roomType) {
        this.isJoinable = isJoinable;
        this.managerId = managerId;
        this.roundNum = roundNum;
        this.roomType = roomType;
    }

    public void setJoinable(Boolean joinable) {
        isJoinable = joinable;
    }
}
