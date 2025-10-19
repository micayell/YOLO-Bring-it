package com.yolo.bringit.userservice.domain.member;

import com.yolo.bringit.userservice.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Entity
@Table(name = "member")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "memberUid", callSuper = false)
public class Member extends BaseTimeEntity implements UserDetails {
    @Id
    @Column(name = "member_uid")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberUid;

    @Comment("이름")
    @Column(name = "name", length = 45, nullable = false)
    private String name;

    @Comment("이메일")
    @Column(name = "email", length = 45, nullable = false)
    private String email;

    @Comment("비밀번호")
    @Column(name = "password", length = 255, nullable = true)
    private String password;

    @Comment("닉네임")
    @Column(name = "nickname", length = 45, nullable = false)
    private String nickname;

    @Comment("소개")
    @Column(name = "intro", length = 255, nullable = true)
    private String intro;

    @Comment("경험치")
    @Column(name = "xp", nullable = false)
    private Integer xp;

    @Comment("코인")
    @Column(name = "coin", nullable = false)
    private Integer coin;

    @Comment("누적 사용 코인")
    @Column(name = "used_coin", nullable = false)
    private Integer usedCoin;

    @Comment("칭찬 점수")
    @Column(name = "yolo_score", nullable = false)
    private Integer yoloScore;

    @Comment("전체 점수")
    @Column(name = "score", nullable = false)
    private Integer score;

    @Comment("1등 우승 횟수")
    @Column(name = "first_win_cnt", nullable = false)
    private Integer firstWinCnt;

    @Comment("2등 우승 횟수")
    @Column(name = "second_win_cnt", nullable = false)
    private Integer secondWinCnt;

    @Comment("3등 우승 횟수")
    @Column(name = "third_win_cnt", nullable = false)
    private Integer thirdWinCnt;

    @Comment("전체 판 수")
    @Column(name = "play_cnt", nullable = false)
    private Integer playCnt;

    @Comment("탈퇴 여부")
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Comment("닉네임 마지막 변경 시각")
    @Column(name = "nickname_modified_at")
    private LocalDateTime nicknameModifiedAt;

    @Column
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> roles = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.roles.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public void setIsDeleted(boolean setIsDeleted) {
        this.isDeleted = setIsDeleted;
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
        this.nicknameModifiedAt = LocalDateTime.now();
    }

    public boolean canChangeNickname() {
        return nicknameModifiedAt == null ||
                Duration.between(nicknameModifiedAt, LocalDateTime.now()).toDays() >= 14;
    }

    public long daysUntilNicknameChangeAvailable() {
        if (nicknameModifiedAt == null) return 0;
        long daysPassed = Duration.between(nicknameModifiedAt, LocalDateTime.now()).toDays();
        long daysLeft = 14 - daysPassed;
        return Math.max(daysLeft, 0);
    }

    public void changeName(String Name) {
        this.name = Name;
    }

    public void changePassword(String Password) {
        this.password = Password;
    }

    @Builder
    public Member(String name, String email, String password, String nickname, String intro, Integer xp, Integer coin, Integer usedCoin, Integer yoloScore, Integer score, Integer firstWinCnt, Integer secondWinCnt, Integer thirdWinCnt, Integer playCnt, Boolean isDeleted, List<String> roles) {
        this.name = name;
        this.email = email;
        this.nickname = nickname;
        this.password = password;
        this.xp = xp;
        this.coin = coin;
        this.usedCoin = usedCoin;
        this.yoloScore = yoloScore;
        this.score = score;
        this.firstWinCnt = firstWinCnt;
        this.secondWinCnt = secondWinCnt;
        this.thirdWinCnt = thirdWinCnt;
        this.playCnt = playCnt;
        this.isDeleted = isDeleted;
        this.roles = roles;
        this.intro = intro;
    }

    public void addXp(int xp) {
        this.xp += xp;
    }

    public void addCoin(int coin) {
        this.coin += coin;
    }

    public void addUsedCoin(int coin) {
        this.usedCoin += coin;
    }

    public void subtractCoin(int coin) {
        this.coin -= coin;
    }

    public void addScore(int score) {
        this.score += score;
    }

    public void increaseFirstWinCount() {
        this.firstWinCnt++;
    }

    public void increaseSecondWinCount() {
        this.secondWinCnt++;
    }

    public void increaseThirdWinCount() {
        this.thirdWinCnt++;
    }

    public void increaseYoloScore() {
        this.yoloScore += 10;
    }

    public void decreaseYoloScore() {
        this.yoloScore -= 10;
    }

    public void increasePlayCount() { this.playCnt++;}
}
