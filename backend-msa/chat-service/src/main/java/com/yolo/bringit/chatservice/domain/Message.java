package com.yolo.bringit.chatservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Entity
@Table(name = "message")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(callSuper = false)
public class Message extends BaseTimeEntity {

    @Id
    @Column(name = "message_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageUid;

    @Comment("메시지 본문")
    @Column(name = "content", nullable = false)
    private String content;

    @Comment("채팅 발신자")
    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Comment("채팅 수신자")
    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;

    @Builder
    public Message(Long messageUid, String content, Long senderId, Long receiverId) {
        this.messageUid = messageUid;
        this.content = content;
        this.senderId = senderId;
        this.receiverId = receiverId;
    }
}
