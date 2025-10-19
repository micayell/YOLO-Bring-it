package com.yolo.bringit.gameservice.dto.room;

import com.yolo.bringit.gameservice.dto.client.ClientResponseDto;
import lombok.*;

import java.util.List;

public class RoomRequestDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateRoom {
        String roomType;
        Integer roundNum;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InviteParticipant {
        Long receiverId;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GetRoomInfo {
        Long roomId;
    }

    // 참가/퇴장 이벤트
    @Getter
    @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ParticipantEvent {
        private String type; // "JOINED" | "LEFT"
        private Long roomId;
        private Long memberId;
        private String nickname; // 선택
    }

    // 현재 방 인원 로스터
    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class RoomRosterDto {
        private Long roomId;
        private List<ClientResponseDto.MemberSimpleInfo> members; // {memberUid, nickname, ...}
    }
}