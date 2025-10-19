package com.yolo.bringit.userservice.domain.item;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Entity
@Table(name="item_category")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "categoryCode", callSuper=false)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ItemCategory {
    @Id
    @Comment("아이템 카테고리 코드")
    private String categoryCode;

    @Comment("아이템 카테고리 이름")
    @Column(name="name", length = 100, nullable = false)
    private String name;

    @Builder
    public ItemCategory(String categoryCode, String name) {
        this.categoryCode = categoryCode;
        this.name = name;
    }
}
