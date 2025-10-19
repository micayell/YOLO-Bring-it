package com.yolo.bringit.userservice.service.member;

import com.yolo.bringit.userservice.dto.member.MemberResponseDto;

import java.util.List;

public interface BlockedMemberService {
    boolean toggleblockMember(Long blockerUid, Long blockedUid);
    List<MemberResponseDto.BlockedMemberInfo> blockedMembers(Long currentUserId);
}
