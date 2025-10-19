package com.yolo.bringit.chatservice.dto;

import com.yolo.bringit.chatservice.domain.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDto {
    private Long messageUid;
    private Long senderId;
    private Long receiverId;
    private String content;
    private LocalDateTime regDt;
    private LocalDateTime modDt;

    /* 엔티티 -> DTO 변환용 헬퍼 */
    public static MessageResponseDto fromEntity (Message msg) {
        return new MessageResponseDto(
                msg.getMessageUid(),
                msg.getSenderId(),
                msg.getReceiverId(),
                msg.getContent(),
                msg.getRegDt(),
                msg.getModDt()
        );
    }
}
