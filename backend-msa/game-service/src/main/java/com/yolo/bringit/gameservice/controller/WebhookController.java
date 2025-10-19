package com.yolo.bringit.gameservice.controller;

import com.yolo.bringit.gameservice.dto.liveKit.LiveKitRequestDto;
import com.yolo.bringit.gameservice.service.liveKit.LiveKitParticipantService;
import com.yolo.bringit.gameservice.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/webhook")
public class WebhookController {
    private final LiveKitParticipantService liveKitParticipantService;
    private final ResponseHandler responseHandler;

    @PostMapping
    public ResponseEntity<?> handleWebhook(@RequestBody LiveKitRequestDto.HandleWebhook handleWebhook) {
        String event = handleWebhook.getEvent();
        String roomId = handleWebhook.getRoom();
        String identity = handleWebhook.getParticipant().getIdentity();

        try {
            switch (event) {
                case "participant_joined" -> {
                    log.info("[Webhook] 참가자 입장: room={}, identity={}", roomId, identity);
                    liveKitParticipantService.handleJoin(roomId, identity);
                }
                case "participant_left" -> {
                    log.info("[Webhook] 참가자 퇴장: room={}, identity={}", roomId, identity);
                    liveKitParticipantService.handleLeave(roomId, identity);
                }
                default -> log.info("[Webhook] 처리되지 않은 이벤트: {}", event);
            }
            return responseHandler.success("이벤트 처리 성공");
        } catch (Exception e) {
            log.error("이벤트 처리 실패");
            return responseHandler.fail("이벤트 처리에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
