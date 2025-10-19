package com.yolo.bringit.userservice.dto.item;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ItemRequestDto {

    /**
     * 아이템 생성을 위한 요청 DTO입니다.
     *
     * 클라이언트가 아이템을 생성할 때 필요한 정보를 담고 있습니다.
     * 필드:
     * - categoryCode: 아이템의 카테고리 코드
     * - itemName: 생성할 아이템의 이름
     * - itemCost: 생성할 아이템의 가격
     * */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateItem {
        private String categoryCode;
        private String itemName;
        private Integer itemCost;
    }
}