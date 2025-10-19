package com.yolo.bringit.userservice.domain.member;

import com.yolo.bringit.userservice.domain.item.Item;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name="item_member")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "itemMemberUid", callSuper=false)
public class ItemMember {
    @Id
    @Column(name="item_member_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemMemberUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="memberId", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="itemId", nullable = false)
    private Item item;

    @Column(name="is_equipped", nullable = false)
    private Boolean isEquipped = false;

    @Builder
    public ItemMember(Member member, Item item, Boolean isEquipped) {
        this.member = member;
        this.item = item;
        this.isEquipped = isEquipped != null ? isEquipped : false;
    }

    public void setEquipped(Boolean equipped) {
        isEquipped = equipped;
    }
}
