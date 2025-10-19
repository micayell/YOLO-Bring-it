package com.yolo.bringit.gameservice.service.liveKit;

public interface LiveKitService {
    String createToken(String roomName, Long userId);
}
