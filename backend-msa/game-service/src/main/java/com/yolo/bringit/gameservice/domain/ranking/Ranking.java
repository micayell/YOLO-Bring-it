package com.yolo.bringit.gameservice.domain.ranking;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yolo.bringit.gameservice.domain.BaseTimeEntity;
import com.yolo.bringit.gameservice.domain.game.Game;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Getter
@Entity
@Table(
        name = "ranking",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_ranking_member_game", columnNames = {"member_id", "gameCode"})
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "rankingUid", callSuper=false)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Ranking extends BaseTimeEntity {

    @Id
    @Column(name="ranking_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rankingUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="gameCode", nullable = false)
    private Game game;

    @Comment("회원 ID")
    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Comment("점수")
    @Column(name="score", nullable = false)
    private Integer score;

    public static Ranking create(Game game, Long memberId, int initialScore) {
        Ranking r = new Ranking();
        r.game = game;
        r.memberId = memberId;
        r.score = initialScore;
        return r;
    }

    public void addScore(int delta) {
        this.score = (this.score == null ? 0 : this.score) + delta;
    }

}

