package com.yolo.bringit.userservice.repository.item;

import com.yolo.bringit.userservice.domain.item.Item;

import java.util.List;

public interface ItemRepositoryCustom {
    List<Item> findByItemCategoryCode(String categoryCode);
}
