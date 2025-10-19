package com.yolo.bringit.gameservice.domain.game;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yolo.bringit.gameservice.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Getter
@Entity
@Table(name="game")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "gameCode", callSuper=false)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Game extends BaseTimeEntity {
    @Id
    @Column(name="game_code")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gameCode;

    @Comment("게임 이름")
    @Column(name="name", nullable = false)
    private String name;

    @Comment("게임 설명")
    @Column(name="description", nullable = false)
    private String description;
}
