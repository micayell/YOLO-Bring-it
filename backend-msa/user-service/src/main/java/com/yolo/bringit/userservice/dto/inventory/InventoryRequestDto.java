package com.yolo.bringit.userservice.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class InventoryRequestDto {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateInventory {
        private Long itemId;
    }
}
