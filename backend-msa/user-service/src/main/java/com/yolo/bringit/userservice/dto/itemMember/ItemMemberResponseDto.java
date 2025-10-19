package com.yolo.bringit.userservice.dto.itemMember;

import lombok.Builder;
import lombok.Getter;

public class ItemMemberResponseDto {
    @Getter
    @Builder
    public static class ItemMemberInfo {
        private Long itemMemberUid;
        private Long itemId;
        private String itemName;
        private String categoryCode;
        private Boolean isEquipped;
        private String img1;
        private String img2;
    }

    @Getter
    @Builder
    public static class ToggleItemEquipInfo {
        private Long itemMemberUid;
        private Long itemId;
        private String categoryCode;
        private Boolean equipped;
    }
}
