package com.yolo.bringit.userservice.service.member;

import com.yolo.bringit.userservice.domain.item.Item;
import com.yolo.bringit.userservice.domain.member.ItemMember;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.itemMember.ItemMemberRequestDto;
import com.yolo.bringit.userservice.repository.item.ItemRepository;
import com.yolo.bringit.userservice.repository.member.ItemMemberRepository;
import com.yolo.bringit.userservice.repository.member.MemberRepository;
import com.yolo.bringit.userservice.service.achievement.AchievementService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemMemberServiceImpl implements ItemMemberService {
    private final ItemRepository itemRepository;
    private final ItemMemberRepository itemMemberRepository;
    private final AchievementService achievementService;
    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public ItemMember purchaseItem(ItemMemberRequestDto.PurchaseItem purchaseItem, Member loginMember) {
        Member member = memberRepository.findById(loginMember.getMemberUid())
                .orElseThrow(() -> new NoSuchElementException("해당 유저를 찾을 수 없습니다"));

        // 1. 해당 아이템이 존재하나 확인
        Item item = itemRepository.findById(purchaseItem.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이템입니다."));

        // 2. 코인이 아이템을 구매하기에 부족하지 않은지 확인
        int cost = item.getCost();
        if (member.getCoin() < cost)
            throw new IllegalStateException("보유 코인이 부족합니다.");

        // 3. 아이템 구매
        member.subtractCoin(cost);
        member.addUsedCoin(cost);
        Member updatedMember = memberRepository.save(member);
        ItemMember createdItemMember = itemMemberRepository.save(ItemMember.builder()
                .item(item)
                .member(updatedMember)
                .build());

        achievementService.checkGoldUsageAchievements(updatedMember);

        achievementService.checkItemCollectionAchievements(updatedMember, item);

        return createdItemMember;

    }

    @Override
    public List<ItemMember> getItemsByCategory(String categoryCode, Member member) {
        return itemMemberRepository.findAllByMemberAndItemCategoryCode(member, categoryCode);
    }

    @Override
    @Transactional
    public ItemMember toggleItemEquip(Long itemMemberUid, Member member) {
        ItemMember targetItem = itemMemberRepository.findByItemMemberUidAndMember(itemMemberUid, member)
                .orElseThrow(() -> new IllegalArgumentException("아이템이 존재하지 않거나 보유하고 있지 않습니다."));

        String categoryCode = targetItem.getItem().getItemCategory().getCategoryCode();

        if (Boolean.TRUE.equals(targetItem.getIsEquipped())) {
            targetItem.setEquipped(false);
        } else {
            itemMemberRepository.findByMemberAndItem_ItemCategory_CategoryCodeAndIsEquippedTrue(member, categoryCode)
                    .ifPresent(otherItem -> otherItem.setEquipped(false));
            targetItem.setEquipped(true);
        }
        return targetItem;
    }
}
