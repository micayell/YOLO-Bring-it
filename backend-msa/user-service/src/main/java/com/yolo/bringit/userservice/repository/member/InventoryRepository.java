package com.yolo.bringit.userservice.repository.member;

import com.yolo.bringit.userservice.domain.member.Inventory;
import com.yolo.bringit.userservice.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    /* 카테고리 별 아이템 전체 조회 */
    List<Inventory> findAllByMemberAndItem_ItemCategory_CategoryCode(Member member, String categoryCode);
    /* 본인의 소유 여부 확인 */
    Optional<Inventory> findByInventoryUidAndMember(Long inventoryUid, Member member);
    /* 동일 카테고리 내 장착 여부 확인 */
    Optional<Inventory> findByMemberAndItem_ItemCategory_CategoryCodeAndIsEquippedTrue(Member member, String categoryCode);
}
