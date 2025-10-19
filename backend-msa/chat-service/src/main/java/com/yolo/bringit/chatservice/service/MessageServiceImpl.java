package com.yolo.bringit.chatservice.service;

import com.yolo.bringit.chatservice.domain.Message;
import com.yolo.bringit.chatservice.dto.MessageRequestDto;
import com.yolo.bringit.chatservice.dto.MessageResponseDto;
import com.yolo.bringit.chatservice.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    @Override
    @Transactional
    public MessageResponseDto sendMessage(Long senderId, MessageRequestDto.SendMessage request) {
        Message msg = Message.builder()
                .senderId(senderId)
                .receiverId(request.getReceiverId())
                .content(request.getContent())
                .build();

        Message saved = messageRepository.save(msg);
        return MessageResponseDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponseDto> getChatHistoryBefore(Long userId, Long peerId, LocalDateTime cursor, int size) {
        PageRequest pageRequest = PageRequest.of(0, size);
        List<Message> history = messageRepository.findMessagesBefore(userId, peerId, cursor, pageRequest);
        return history.stream().map(MessageResponseDto::fromEntity).collect(Collectors.toList());
    }
}
