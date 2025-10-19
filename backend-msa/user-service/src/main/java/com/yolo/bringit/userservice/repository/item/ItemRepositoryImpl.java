package com.yolo.bringit.userservice.repository.item;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.yolo.bringit.userservice.domain.file.QYoloFile;
import com.yolo.bringit.userservice.domain.item.Item;
import jakarta.persistence.EntityManager;

import java.util.List;

import static com.yolo.bringit.userservice.domain.file.QYoloFile.*;
import static com.yolo.bringit.userservice.domain.item.QItem.*;
import static com.yolo.bringit.userservice.domain.item.QItemCategory.*;
import static com.yolo.bringit.userservice.domain.item.QItemFile.*;

public class ItemRepositoryImpl implements ItemRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    public ItemRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    @Override
    public List<Item> findByItemCategoryCode(String categoryCode) {
        List<Item> result = queryFactory
                .selectFrom(item).distinct()
                .join(item.itemCategory, itemCategory).fetchJoin()
                .leftJoin(item.itemFiles, itemFile).fetchJoin()
                .leftJoin(itemFile.yoloFile, yoloFile).fetchJoin()
                .where(item.itemCategory.categoryCode.eq(categoryCode))
                .fetch();

        return result;
    }
}
