package com.yolo.bringit.gameservice.service.liveKit;

public interface LiveKitParticipantService {
    void handleJoin(String roomId, String identity);
    void handleLeave(String roomId, String identity);
}
