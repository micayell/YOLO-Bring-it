package com.yolo.bringit.userservice.service.item;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.item.ItemResponseDto;

import java.util.List;

public interface ItemService {
    List<ItemResponseDto.ItemInfo> getItems(String kind, Member member);
}
