package com.yolo.bringit.userservice.service.member;

import com.yolo.bringit.userservice.domain.member.ItemMember;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.itemMember.ItemMemberRequestDto;

import java.util.List;

public interface ItemMemberService {
    ItemMember purchaseItem(ItemMemberRequestDto.PurchaseItem purchaseItem, Member member);
    /* 해당 카테고리 내 멤버의 인벤토리 아이템 조회 */
    List<ItemMember> getItemsByCategory(String categoryCode, Member member);
    /* 카테고리 별 아이템 장착/해제 */
    ItemMember toggleItemEquip(Long itemMemberUid, Member member);
}
