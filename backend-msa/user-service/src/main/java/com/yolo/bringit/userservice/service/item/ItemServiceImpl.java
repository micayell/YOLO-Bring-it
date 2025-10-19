package com.yolo.bringit.userservice.service.item;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.domain.item.Item;
import com.yolo.bringit.userservice.dto.item.ItemResponseDto;
import com.yolo.bringit.userservice.repository.item.ItemRepository;
import com.yolo.bringit.userservice.repository.member.ItemMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {
    private final ItemRepository itemRepository;
    private final ItemMemberRepository itemMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDto.ItemInfo> getItems(String kind, Member member) {
        String itemcategory;
        switch (kind.toLowerCase()) {
            case "title":
                itemcategory = "TIT";
                break;
            case "character":
                itemcategory = "CHA";
                break;
            case "badge":
                itemcategory = "BAD";
                break;
            default:
                throw new IllegalArgumentException("유효하지 않은 아이템입니다: ");
        }

        List<Item> items = itemRepository.findByItemCategoryCode(itemcategory);

        Set<Long> ownedItemSet = (member == null)
                ? Collections.emptySet()
                : itemMemberRepository.findOwnedItemIdsByMemberAndCategory(member.getMemberUid(), itemcategory);

        return items.stream()
                .map(item -> ItemResponseDto.ItemInfo.builder()
                        .itemUid(item.getItemUid())
                        .name(item.getName())
                        .cost(item.getCost())
                        .categoryCode(item.getItemCategory().getCategoryCode())
                        .categoryName(item.getItemCategory().getName())
                        .owned(ownedItemSet.contains(item.getItemUid()))
                        .img1(
                                item.getItemFiles().stream()
                                        .map(f -> f.getYoloFile())
                                        .filter(Objects::nonNull)
                                        .filter(yf -> !yf.getExt().equals("glb"))
                                        .map(yf -> yf.getPath())
                                        .filter(Objects::nonNull)
                                        .findFirst()
                                        .orElse(null)
                        )
                        .img2(
                                item.getItemFiles().stream()
                                        .map(f -> f.getYoloFile())
                                        .filter(Objects::nonNull)
                                        .filter(yf -> yf.getExt().equals("glb"))
                                        .map(yf -> yf.getPath())
                                        .filter(Objects::nonNull)
                                        .findFirst()
                                        .orElse(null)
                        )
                        .build()
                )
                .collect(Collectors.toList());
    }
}
