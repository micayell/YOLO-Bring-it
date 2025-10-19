package com.yolo.bringit.userservice.domain.achievement;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yolo.bringit.userservice.domain.BaseTimeEntity;
import com.yolo.bringit.userservice.domain.item.Item;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Getter
@Entity
@Table(name="achievement")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "achievementUid", callSuper=false)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Achievement extends BaseTimeEntity {

    @Id
    @Column(name="achievement_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long achievementUid;

    @Comment("업적 이름")
    @Column(name="name", nullable = false)
    private String name;

    @Comment("업적 설명")
    @Column(name="exp", nullable = false)
    private String exp;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itemId")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Item item;
}
