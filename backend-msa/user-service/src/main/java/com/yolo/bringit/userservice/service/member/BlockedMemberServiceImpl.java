package com.yolo.bringit.userservice.service.member;

import com.yolo.bringit.userservice.domain.member.BlockedMember;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.member.MemberResponseDto;
import com.yolo.bringit.userservice.repository.member.BlockedMemberRepository;
import com.yolo.bringit.userservice.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlockedMemberServiceImpl implements BlockedMemberService {
    private final BlockedMemberRepository blockedMemberRepository;
    private final MemberRepository memberRepository;

    public boolean toggleblockMember(Long blockerId, Long blockedId) {

        Member blockermember = memberRepository.findById(blockerId)
                .orElseThrow(() -> new IllegalArgumentException("잘못된 정보 입니다."));

        Member blockedmember = memberRepository.findByMemberUidAndIsDeletedFalse(blockedId)
                .orElseThrow(() -> new IllegalArgumentException("차단 대상 회원이 없습니다."));

        Optional<BlockedMember> blockOptional = blockedMemberRepository
                .findByBlocker_MemberUidAndBlocked_MemberUid(blockerId, blockedId);

        if (blockOptional.isPresent()) {
            blockedMemberRepository.delete(blockOptional.get());
            return false;
        }
        BlockedMember block = BlockedMember.builder().blocker(blockermember).blocked(blockedmember).build();
        blockedMemberRepository.save(block);
        return true;
    }

    @Override
    public List<MemberResponseDto.BlockedMemberInfo> blockedMembers(Long currentUserId) {
        List<BlockedMember> blocks = blockedMemberRepository.findByBlocker_MemberUidAndBlocked_IsDeletedFalse(currentUserId);

        return blocks.stream()
                .map(block -> new MemberResponseDto.BlockedMemberInfo(block.getBlocked().getMemberUid(), block.getBlocked().getNickname()))
                .collect(Collectors.toList());
    }
}
