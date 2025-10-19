package com.yolo.bringit.chatservice.controller;

import com.yolo.bringit.chatservice.dto.MessageResponseDto;
import com.yolo.bringit.chatservice.dto.ResponseDto;
import com.yolo.bringit.chatservice.service.MessageService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/chats")
public class MessageController {

    private final MessageService messageService;
    private final ResponseDto responseDto;

    @Operation(summary = "채팅 내역 불러오기", description = "일대일 채팅 내역을 불러옵니다.")
    @GetMapping("/{peer-id}/history")
    public ResponseEntity<?> getChatHistory(@RequestHeader("X-MEMBER-UID") Long userId, @PathVariable("peer-id") Long peerId,
                                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime cursor,
                                            @RequestParam(defaultValue = "20") int size) {
        try {
            if (cursor == null) {
                cursor = LocalDateTime.now().plusSeconds(1);
            }
            List<MessageResponseDto> history = messageService.getChatHistoryBefore(userId, peerId, cursor, size);
            return responseDto.success(history);
        } catch (Exception e) {
            log.error("채팅 내역 조회 실패", e);
            return responseDto.fail("대화 내용 조회에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
