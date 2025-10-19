package com.yolo.bringit.userservice.domain.item;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@Table(name="item")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "itemUid", callSuper=false)
@ToString(of = {"itemUid", "name", "cost"})
public class Item {
    @Id
    @Column(name="item_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemUid;

    @Comment("아이템 이름")
    @Column(name="name", length = 100, nullable = false)
    private String name;

    @Comment("아이템 금액")
    @Column(name="cost", nullable = true)
    private Integer cost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itemCategoryId")
    private ItemCategory itemCategory;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemFile> itemFiles = new ArrayList<>();

    @Builder
    public Item(Long itemUid, String name, Integer cost, ItemCategory itemCategory) {
        this.itemUid = itemUid;
        this.name = name;
        this.cost = cost;
        this.itemCategory = itemCategory;
    }
}
