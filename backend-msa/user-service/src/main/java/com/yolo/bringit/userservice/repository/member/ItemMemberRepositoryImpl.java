package com.yolo.bringit.userservice.repository.member;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.yolo.bringit.userservice.domain.member.ItemMember;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.domain.member.QMember;
import jakarta.persistence.EntityManager;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.yolo.bringit.userservice.domain.file.QYoloFile.*;
import static com.yolo.bringit.userservice.domain.item.QItem.*;
import static com.yolo.bringit.userservice.domain.item.QItemCategory.*;
import static com.yolo.bringit.userservice.domain.item.QItemFile.*;
import static com.yolo.bringit.userservice.domain.member.QItemMember.*;
import static com.yolo.bringit.userservice.domain.member.QMember.member;

public class ItemMemberRepositoryImpl implements ItemMemberRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    public ItemMemberRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    @Override
    public List<ItemMember> findAllByMemberAndItemCategoryCode(Member member, String categoryCode) {
        return queryFactory
                .selectFrom(itemMember).distinct()
                .join(itemMember.member, QMember.member).fetchJoin()           // 필요 시 fetchJoin
                .join(itemMember.item, item).fetchJoin()
                .join(item.itemCategory, itemCategory).fetchJoin()
                .leftJoin(item.itemFiles, itemFile).fetchJoin()
                .leftJoin(itemFile.yoloFile, yoloFile).fetchJoin()
                .where(
                        memberEq(member),
                        itemCategoryCodeEq(categoryCode)
                )
                .fetch();
    }

    @Override
    public Set<Long> findOwnedItemIdsByMemberAndCategory(Long memberId, String categoryCode) {
        List<Long> ids = queryFactory
                .select(item.itemUid)
                .from(itemMember)
                .join(itemMember.item, item)
                .join(item.itemCategory, itemCategory)
                .join(itemMember.member, member)
                .where(
                        member.memberUid.eq(memberId),
                        itemCategory.categoryCode.eq(categoryCode)
                )
                .fetch();
        return new HashSet<>(ids);
    }

    private BooleanExpression itemCategoryCodeEq(String code) {
        return (code == null || code.isBlank()) ? null : itemCategory.categoryCode.eq(code);
    }

    private BooleanExpression memberEq(Member m) {
        return (m == null) ? null : itemMember.member.eq(m);
    }

    @Override
    public String findEquipped2dCharacterItemPath(Long memberId) {
        return queryFactory
                .select(yoloFile.path)
                .from(itemMember)
                .join(itemMember.item, item)
                .join(itemFile).on(itemFile.item.eq(item))
                .join(yoloFile).on(yoloFile.eq(itemFile.yoloFile))
                .where(
                        itemMember.member.memberUid.eq(memberId),
                        itemMember.isEquipped.isTrue(),
                        item.itemCategory.categoryCode.eq("CHA"),
                        yoloFile.ext.eq("png")
                )
                .fetchOne();
    }

    @Override
    public String findEquipped3dCharacterItemPath(Long memberId) {
        return queryFactory
                .select(yoloFile.path)
                .from(itemMember)
                .join(itemMember.item, item)
                .join(itemFile).on(itemFile.item.eq(item))
                .join(yoloFile).on(yoloFile.eq(itemFile.yoloFile))
                .where(
                        itemMember.member.memberUid.eq(memberId),
                        itemMember.isEquipped.isTrue(),
                        item.itemCategory.categoryCode.eq("CHA"),
                        yoloFile.ext.eq("glb")
                )
                .fetchOne();
    }

    @Override
    public String findEquippedBadgeItemName(Long memberId) {
        return queryFactory
                .select(item.name)
                .from(itemMember)
                .join(itemMember.item, item)
                .where(
                        itemMember.member.memberUid.eq(memberId),
                        itemMember.isEquipped.isTrue(),
                        item.itemCategory.categoryCode.eq("BAD")
                )
                .fetchFirst();
    }

    @Override
    public String findEquippedTitleItemPath(Long memberId) {
        return queryFactory
                .select(yoloFile.path)
                .from(itemMember)
                .join(itemMember.item, item)
                .join(itemFile).on(itemFile.item.eq(item))
                .join(yoloFile).on(yoloFile.eq(itemFile.yoloFile))
                .where(
                        itemMember.member.memberUid.eq(memberId),
                        itemMember.isEquipped.isTrue(),
                        item.itemCategory.categoryCode.eq("TIT")
                )
                .fetchOne();
    }
}
