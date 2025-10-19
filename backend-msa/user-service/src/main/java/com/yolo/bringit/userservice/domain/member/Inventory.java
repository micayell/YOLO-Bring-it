package com.yolo.bringit.userservice.domain.member;

import com.yolo.bringit.userservice.domain.item.Item;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name="inventory")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "inventoryUid", callSuper=false)
public class Inventory {
    @Id
    @Column(name="inventory_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="memberId", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="itemId", nullable = false)
    private Item item;

    @Column(name="is_equipped", nullable = false)
    private Boolean isEquipped = false;

    @Builder
    public Inventory(Member member, Item item, Boolean isEquipped) {
        this.member = member;
        this.item = item;
        this.isEquipped = isEquipped != null ? isEquipped : false;
    }

    public void setEquipped(Boolean equipped) {
        isEquipped = equipped;
    }
}
