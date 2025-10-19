package com.yolo.bringit.gameservice.dto.room;

import lombok.*;

public class RoomResponseDto {
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomInfo {
        private Long roomUid;
        private Boolean isJoinable;
        private String managerNickname;
        private Integer roundNum;
        private String roomType;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomInfoWithoutManager {
        private Long roomUid;
        private Boolean isJoinable;
        private Integer roundNum;
        private String roomType;
    }
}
