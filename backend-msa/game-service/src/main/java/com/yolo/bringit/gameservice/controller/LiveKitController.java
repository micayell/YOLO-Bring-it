package com.yolo.bringit.gameservice.controller;

import com.yolo.bringit.gameservice.dto.ResponseDto;
import com.yolo.bringit.gameservice.service.liveKit.LiveKitService;
import com.yolo.bringit.gameservice.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/livekit")
public class LiveKitController {

    private final LiveKitService liveKitService;
    private final ResponseHandler responseHandler;

    @PostMapping("/token/{room-id}")
    public ResponseEntity<?> createToken(@PathVariable("room-id") Long roomId,
                                         @RequestHeader("X-MEMBER-UID") Long userId) {
        try {
            String token = liveKitService.createToken(roomId.toString(), userId);
            return responseHandler.success(Map.of("token", token));
        } catch (Exception e) {
            log.error("LiveKit 토큰 생성 실패", e);
            return responseHandler.fail("LiveKit 토큰 생성에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
