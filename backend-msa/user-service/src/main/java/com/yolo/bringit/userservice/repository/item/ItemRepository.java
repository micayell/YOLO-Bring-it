package com.yolo.bringit.userservice.repository.item;

import com.yolo.bringit.userservice.domain.item.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long>, ItemRepositoryCustom {
    Optional<Item> findByName(String name);
    //List<Item> findByItemCategory_CategoryCode(String categoryCode);
}
