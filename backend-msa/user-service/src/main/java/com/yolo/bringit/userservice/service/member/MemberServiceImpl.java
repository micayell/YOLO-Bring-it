package com.yolo.bringit.userservice.service.member;

import com.yolo.bringit.userservice.domain.item.Item;
import com.yolo.bringit.userservice.domain.member.ItemMember;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.member.MemberRequestDto;
import com.yolo.bringit.userservice.dto.member.MemberResponseDto;
import com.yolo.bringit.userservice.dto.token.TokenResponseDto;
import com.yolo.bringit.userservice.enums.Authority;
import com.yolo.bringit.userservice.repository.item.ItemRepository;
import com.yolo.bringit.userservice.repository.member.ItemMemberRepository;
import com.yolo.bringit.userservice.repository.member.MemberRepository;
import com.yolo.bringit.userservice.repository.token.VerificationTokenRepository;
import com.yolo.bringit.userservice.security.provider.TokenProvider;
import com.yolo.bringit.userservice.service.achievement.AchievementService;
import com.yolo.bringit.userservice.service.day.DayService;
import com.yolo.bringit.userservice.service.token.RefreshTokenService;
import com.yolo.bringit.userservice.util.EmailUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {
    private final RefreshTokenService refreshTokenService;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final TokenProvider tokenProvider;

    private final EmailUtil emailUtil;
    private final VerificationTokenRepository verificationTokenRepository;
    private final DayService dayService;
    private final AchievementService achievementService;
    private final ItemMemberRepository itemMemberRepository;
    private final ItemRepository itemRepository;

    @Transactional
    @Override
    public void signUp(MemberRequestDto.SignUp request) {
        boolean isVerified = verificationTokenRepository.existsByEmailAndUsedTrue(request.getEmail());
        if (!isVerified) {
            throw new IllegalArgumentException("이메일 인증이 완료되지 않았습니다.");
        }

        if (memberRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("중복된 닉네임입니다.");
        }

        Member newMember = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .name(request.getName())
                .intro(request.getIntro())
                .xp(0)
                .coin(0)
                .usedCoin(0)
                .yoloScore(0)
                .score(0)
                .playCnt(0)
                .firstWinCnt(0)
                .secondWinCnt(0)
                .thirdWinCnt(0)
                .isDeleted(false)
                .roles(Collections.singletonList(Authority.ROLE_USER.name()))
                .build();
        memberRepository.save(newMember);

        // 기본 아이템(돌멩이) 지급
        Item item = itemRepository.findById(35L)
                .orElseThrow(() -> new IllegalArgumentException("기본 아이템을 찾을 수 없습니다."));

        ItemMember itemMember = ItemMember.builder()
                .member(newMember)
                .item(item)
                .isEquipped(true)
                .build();
        itemMemberRepository.save(itemMember);
    }

    @Override
    @Transactional
    public Optional<Member> getMemberById(Long memberId) {
        return memberRepository.findByMemberUid(memberId);
    }

    @Override
    @Transactional
    public void withdraw(Long memberId) {
        Member member = memberRepository.findByMemberUid(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        member.setIsDeleted(true);
    }

    @Override
    @Transactional
    public Member getByCredentials(final String email, final String password) {
        final Member member = memberRepository.findByEmail(email).orElse(null);

        if (member != null && passwordEncoder.matches(password, member.getPassword())) {
            return member;
        } else {
            return member;
        }

        //return null;
    }

    @Override
    @Transactional
    public TokenResponseDto.TokenInfo login(MemberRequestDto.Login memberLoginRequestDto) {
        Member member = getByCredentials(memberLoginRequestDto.getEmail(), memberLoginRequestDto.getPassword());

        if (member == null) {
            return null;
        }

        System.out.println("토큰 시작");

        UsernamePasswordAuthenticationToken authenticationToken = memberLoginRequestDto.toAuthentication();
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken); // 실제 검증
        TokenResponseDto.TokenInfo tokenInfo = tokenProvider.generateTokens(authentication);

        String char2dpath = getEquipped2dCharacterPath(member.getMemberUid());
        String char3dpath = getEquipped3dCharacterPath(member.getMemberUid());
        String badgename = getEquippedBadgeName(member.getMemberUid());
        String titlepath = getEquippedTitlePath(member.getMemberUid());

        tokenInfo.setMemberInfo(MemberResponseDto.MemberInfo.builder()
                .memberUid(member.getMemberUid())
                .name(member.getName())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .intro(member.getIntro())
                .xp(member.getXp())
                .coin(member.getCoin())
                .usedCoin(member.getUsedCoin())
                .yoloScore(member.getYoloScore())
                .score(member.getScore())
                .firstWinCnt(member.getFirstWinCnt())
                .secondWinCnt(member.getSecondWinCnt())
                .thirdWinCnt(member.getThirdWinCnt())
                .playCnt(member.getPlayCnt())
                .char2dpath(char2dpath)
                .char3dpath(char3dpath)
                .badgename(badgename)
                .titlepath(titlepath)
                .build());

        refreshTokenService.writeTokenInfo(member.getEmail(), tokenInfo.getAccessToken(), tokenInfo.getRefreshToken());
        dayService.checkAttendance(member);
        achievementService.checkTotalAttendanceAchievements(member);
        achievementService.checkConsecutiveAttendanceAchievements(member);

        return tokenInfo;
    }

    @Override
    @Transactional
    public Member updateByMemberUid(Long memberId, MemberRequestDto.UpdateMemberRequestDto newMember) throws Exception {
        return memberRepository.findByMemberUid(memberId)
                .map(member -> {
                    if (newMember.getPassword() != null && !passwordEncoder.matches(newMember.getPassword(), member.getPassword())) {
                        throw new IllegalArgumentException("기존 비밀번호가 일치하지 않습니다.");
                    }
                    if(!member.getNickname().equals(newMember.getNickname())) {
                        if (memberRepository.existsByNickname(newMember.getNickname())) {
                            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
                        }
                        if (!member.canChangeNickname()) {
                            long daysLeft = member.daysUntilNicknameChangeAvailable();
                            throw new IllegalArgumentException("닉네임은 14일에 한 번만 변경할 수 있습니다. " + daysLeft + "일 후에 다시 시도해주세요.");
                        }
                        member.changeNickname(newMember.getNickname());
                    }
                    if(!member.getName().equals(newMember.getName())) {
                        member.changeName(newMember.getName());
                    }
                    if (newMember.getPassword() != null && newMember.getNewpassword() != null && !newMember.getNewpassword().isBlank()) {
                        member.changePassword(
                                passwordEncoder.encode(newMember.getNewpassword())
                                //newMember.getNewpassword()
                        );
                    }
                    return memberRepository.save(member);
                })
                .orElseThrow(() -> new Exception("회원 정보를 불러올 수 없습니다: "));
    }

    @Override
    @Transactional
    public List<MemberResponseDto.ScoreInfo> bulkUpdateScore(List<Map<String, Object>> scoreList) {

        List<MemberResponseDto.ScoreInfo> result = new ArrayList<>();
        for (Map<String, Object> map : scoreList) {

            Object raw = map.get("userId");
            if (!(raw instanceof Number)) {
                throw new IllegalArgumentException("userId가 숫자가 아닙니다: " + raw);
            }
            Long userId = ((Number) raw).longValue();

            Member member = memberRepository.findById(userId)
                    .orElseThrow(() -> new NoSuchElementException("해당 유저를 찾을 수 없습니다: " + userId));


            // 점수 증가 및 등수 count
            int finalScore = Optional.ofNullable(map.get("finalScore"))
                    .map(val -> (int) val)
                    .orElse(0);

            int finalXp = Optional.ofNullable(map.get("finalXp"))
                    .map(val -> (int) val)
                    .orElse(0);

            int finalCoin = Optional.ofNullable(map.get("finalCoin"))
                    .map(val -> (int) val)
                    .orElse(0);

            int currentRank = Optional.ofNullable(map.get("currentRank"))
                    .map(val -> (int) val)
                    .orElse(0);

            int totalScore = Optional.ofNullable(map.get("totalScore"))
                    .map(val -> (int) val)
                    .orElse(0);

            member.addScore(finalScore);
            if (currentRank == 1) member.increaseFirstWinCount();
            else if (currentRank == 2) member.increaseSecondWinCount();
            else if (currentRank == 3) member.increaseThirdWinCount();
            member.addCoin(finalCoin);
            member.addXp(finalXp);
            member.increasePlayCount();

            result.add(MemberResponseDto.ScoreInfo.builder()
                            .rank(currentRank)
                            .userId(member.getMemberUid())
                            .totalScore(totalScore)
                            .playCnt(member.getPlayCnt())
                            .firstWinCnt(member.getFirstWinCnt())
                            .secondWinCnt(member.getSecondWinCnt())
                            .thirdWinCnt(member.getThirdWinCnt())
                            .nickname(member.getNickname())
                            .build());
        }

        return result;
    }

    @Override
    @Transactional
    public Optional<Member> getMemberByEmailAndName(String email, String name) {
        return memberRepository.findByEmailAndName(email, name);
    }

    @Override
    @Transactional
    public Optional<Member> getMemberByEmail(String email) {
        return memberRepository.findByEmail(email);
    }

    @Override
    @Transactional
    public List<MemberResponseDto.MemberInfoWithUid> searchMemberByNickname(String keyword) {
        List<Member> members = memberRepository.findByNicknameContaining(keyword);

        return members.stream()
                .map(m -> new MemberResponseDto.MemberInfoWithUid(
                        m.getMemberUid(),
                        m.getName(),
                        m.getEmail(),
                        m.getNickname(),
                        m.getIntro()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<Long, MemberResponseDto.MemberSimpleInfo> getActiveMemberInfoMap(List<Long> memberIds) {
        List<Member> members = memberRepository.findByMemberUidInAndIsDeletedFalse(memberIds);

        return members.stream()
                .collect(Collectors.toMap(
                        Member::getMemberUid,
                        m -> MemberResponseDto.MemberSimpleInfo.builder()
                                .email(m.getEmail())
                                .name(m.getName())
                                .intro(m.getIntro())
                                .memberUid(m.getMemberUid())
                                .nickname(m.getNickname())
                                .isDeleted(m.getIsDeleted())
                                .build()
                ));
    }

    @Override
    @Transactional
    public MemberResponseDto.GameRankingPage getTotalRankings(Long userId, int page, int size) {
        // 전체 랭킹 정보 조회
        List<Member> allMembers = memberRepository.findByIsDeletedFalseOrderByScoreDesc();

        // 페이지네이션 + 랭킹 계산
        List<MemberResponseDto.GameRanking> pageRankings = new ArrayList<>();

        int rank = 1, count = 1, prevScore = -1, idx = 0, myRank = 0;

        for (Member m : allMembers) {
            int score = m.getScore();
            if (score != prevScore) rank = count;

            if (idx >= page * size && idx < (page + 1) * size) {
                pageRankings.add(MemberResponseDto.GameRanking.builder()
                        .place(rank)
                        .nickname(m.getNickname())
                        .score(score)
                        .build());
            }

            if (m.getMemberUid().equals(userId)) {
                myRank = rank;
            }

            prevScore = score;
            count++;
            idx++;
        }

        // 내 랭킹 정보 구성
        Member me = allMembers.stream()
                .filter(m -> m.getMemberUid().equals(userId))
                .findFirst()
                .orElse(null);

        MemberResponseDto.GameRanking myRankDto = MemberResponseDto.GameRanking.builder()
                .place(myRank)
                .nickname(me != null ? me.getNickname() : null)
                .score(me != null ? me.getScore() : 0)
                .build();

        return MemberResponseDto.GameRankingPage.builder()
                .myRanking(myRankDto)
                .rankings(pageRankings)
                .hasNext((page + 1) * size < allMembers.size())
                .build();
    }

    public String getEquipped2dCharacterPath(Long memberId) {
        return itemMemberRepository.findEquipped2dCharacterItemPath(memberId);
    }

    public String getEquipped3dCharacterPath(Long memberId) {
        return itemMemberRepository.findEquipped3dCharacterItemPath(memberId);
    }

    public String getEquippedBadgeName(Long memberId) {
        return itemMemberRepository.findEquippedBadgeItemName(memberId);
    }

    public String getEquippedTitlePath(Long memberId) {
        return itemMemberRepository.findEquippedTitleItemPath(memberId);
    }

    @Override
    @Transactional
    public void resetPassword(Long memberId, String newPassword) {
        itemMemberRepository.findById(memberId).ifPresent(itemMember ->
                itemMember.getMember().changePassword(newPassword));
    }
}
