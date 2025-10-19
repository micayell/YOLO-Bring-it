package com.yolo.bringit.userservice.dto.item;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class ItemResponseDto {
    /**
     * 아이템 데이터 반환을 위한 응답 DTO입니다.
     *
     * 서버에서 아이템을 반환할 때 필요한 정보를 담고 있습니다.
     * 필드:
     * - itemUid: 아이템의 아이디
     * - name: 아이템 이름
     * - cost: 아이템 가격
     *
     * */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemInfo {
        private Long itemUid;
        private String name;
        private Integer cost;
        private String categoryCode;
        private String categoryName;
        private boolean owned;
        private String img1; // 2D 이미지
        private String img2; // 3D 이미지
    }
}
