package com.yolo.bringit.userservice.repository.member;

import com.yolo.bringit.userservice.domain.member.BlockedMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockedMemberRepository extends JpaRepository<BlockedMember, Long> {
    List<BlockedMember> findByBlocker_MemberUidAndBlocked_IsDeletedFalse(Long blockerId);
    Optional<BlockedMember> findByBlocker_MemberUidAndBlocked_MemberUid(Long blockerId, Long blockedId);
}
