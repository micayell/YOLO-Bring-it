package com.yolo.bringit.userservice.dto.inventory;

import lombok.Builder;
import lombok.Getter;

public class InventoryResponseDto {
    @Getter
    @Builder
    public static class InventoryInfo {
        private Long inventoryUid;
        private Long itemId;
        private String itemName;
        private String categoryCode;
        private Boolean isEquipped;
        // private String imageUrl;
    }

    @Getter
    @Builder
    public static class ToggleEquipInfo {
        private Long inventoryUid;
        private Long itemId;
        private String categoryCode;
        private Boolean equipped;
    }
}
