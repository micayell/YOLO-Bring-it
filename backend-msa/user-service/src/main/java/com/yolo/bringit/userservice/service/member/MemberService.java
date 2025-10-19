package com.yolo.bringit.userservice.service.member;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.member.MemberRequestDto;
import com.yolo.bringit.userservice.dto.member.MemberResponseDto;
import com.yolo.bringit.userservice.dto.token.TokenResponseDto;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface MemberService {
    void signUp(MemberRequestDto.SignUp request);
    void withdraw(Long memberId);
    Optional<Member> getMemberById(Long memberId);
    Member getByCredentials(final String email, final String password);
    TokenResponseDto.TokenInfo login(MemberRequestDto.Login LoginDto);
    Optional<Member> getMemberByEmailAndName(String email, String name);
    Optional<Member> getMemberByEmail(String email);
    //    public void encodeExistingPasswords();
    Member updateByMemberUid(Long memberId, MemberRequestDto.UpdateMemberRequestDto newMember) throws Exception;
    List<MemberResponseDto.ScoreInfo> bulkUpdateScore(List<Map<String, Object>> scoreList);
    List<MemberResponseDto.MemberInfoWithUid> searchMemberByNickname(String keyword);
    Map<Long, MemberResponseDto.MemberSimpleInfo> getActiveMemberInfoMap(List<Long> memberIds);
    MemberResponseDto.GameRankingPage getTotalRankings(Long userId, int page, int size);
    void resetPassword(Long memberId, String newPassword);
    String getEquipped2dCharacterPath(Long memberId);
    String getEquipped3dCharacterPath(Long memberId);
    String getEquippedBadgeName(Long memberId);
    String getEquippedTitlePath(Long memberId);
}
