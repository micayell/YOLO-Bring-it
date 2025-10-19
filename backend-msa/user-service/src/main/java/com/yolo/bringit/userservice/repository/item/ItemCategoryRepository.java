package com.yolo.bringit.userservice.repository.item;

import com.yolo.bringit.userservice.domain.item.ItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItemCategoryRepository extends JpaRepository<ItemCategory, String>  {
    Optional<ItemCategory> findByCategoryCode(String categoryCode);
}
