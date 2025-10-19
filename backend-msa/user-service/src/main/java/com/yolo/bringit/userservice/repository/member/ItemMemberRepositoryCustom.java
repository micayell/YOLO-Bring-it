package com.yolo.bringit.userservice.repository.member;

import com.yolo.bringit.userservice.domain.member.ItemMember;
import com.yolo.bringit.userservice.domain.member.Member;

import java.util.List;
import java.util.Set;

public interface ItemMemberRepositoryCustom {
    List<ItemMember> findAllByMemberAndItemCategoryCode(Member member, String categoryCode);
    Set<Long> findOwnedItemIdsByMemberAndCategory(Long memberId, String categoryCode);
    String findEquipped2dCharacterItemPath(Long memberId);
    String findEquipped3dCharacterItemPath(Long memberId);
    String findEquippedBadgeItemName(Long memberId);
    String findEquippedTitleItemPath(Long memberId);
}
