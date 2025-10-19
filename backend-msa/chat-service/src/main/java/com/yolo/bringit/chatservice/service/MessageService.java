package com.yolo.bringit.chatservice.service;

import com.yolo.bringit.chatservice.dto.MessageRequestDto;
import com.yolo.bringit.chatservice.dto.MessageResponseDto;

import java.time.LocalDateTime;
import java.util.List;

public interface MessageService {
    /* 새 메시지 저장 후 저장된 메시지 반환 */
    MessageResponseDto sendMessage(Long senderId, MessageRequestDto.SendMessage request);

    /* cursor 전 메시지 중 user <-> peer 대화 내용을 최신순으로 조회 */
    List<MessageResponseDto> getChatHistoryBefore(Long userId, Long peerId, LocalDateTime cursor, int size);
}
