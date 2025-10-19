package com.yolo.bringit.gameservice.service.room;

import com.yolo.bringit.gameservice.domain.room.Room;
import com.yolo.bringit.gameservice.dto.room.RoomRequestDto;

public interface RoomService {
    Room matchRandom(Long userId);
    Room createCustom(RoomRequestDto.CreateRoom createRoom, Long userId);
    void inviteParticipant(Long roomId, Long senderId, Long receiverId);
    void acceptParticipantRequest(Long roomId, Long senderId, Long receiverId);
    boolean closeRoom(Long roomId, Long userId);
    void leaveRoom(Long roomId, Long userId);
    boolean toggleReadyRoom(Long roomId, Long userId);
}
