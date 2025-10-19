package com.yolo.bringit.chatservice.controller;

import com.yolo.bringit.chatservice.dto.MessageRequestDto;
import com.yolo.bringit.chatservice.dto.MessageResponseDto;
import com.yolo.bringit.chatservice.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    /**
     * 클라이언트 -> 서버 메시지 전송
     * 전송 경로 : /publish/chat/send
     */
    @MessageMapping("/chat/send")
    public void sendMessage(MessageRequestDto.SendMessage request, Principal principal) {
        Long senderId = Long.valueOf(principal.getName());

        MessageResponseDto saved = messageService.sendMessage(senderId, request);

        String destinationReceiver = "/queue/chat-user-" + saved.getReceiverId();
        String destinationSender = "/queue/chat-user-" + saved.getSenderId();
        simpMessagingTemplate.convertAndSend(destinationReceiver, saved);
        simpMessagingTemplate.convertAndSend(destinationSender, saved);
    }
}
