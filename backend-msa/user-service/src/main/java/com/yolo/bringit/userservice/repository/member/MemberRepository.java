package com.yolo.bringit.userservice.repository.member;

import com.yolo.bringit.userservice.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    Optional<Member> findByEmailAndName(String email, String name);
    Optional<Member> findByMemberUid(Long memberUid);
    Optional<Member> findByMemberUidAndIsDeletedFalse(Long memberUid);
    boolean existsByNickname(String nickname);
    boolean existsByEmail(String email);
    List<Member> findByIsDeletedFalseOrderByScoreDesc();
    List<Member> findByNicknameContaining(String nickname);
    List<Member> findByMemberUidInAndIsDeletedFalse(List<Long> memberIds);
}
