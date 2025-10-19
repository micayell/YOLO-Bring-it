package com.yolo.bringit.userservice.dto.itemMember;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ItemMemberRequestDto {
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PurchaseItem {
        private Long itemId;
    }
}
