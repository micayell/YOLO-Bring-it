package com.yolo.bringit.userservice.repository.member;

import com.yolo.bringit.userservice.domain.member.Friend;
import com.yolo.bringit.userservice.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend, Long>, FriendRepositoryCustom {
    /* 친구 요청이 존재하는지 확인 (중복 요청 방지) */
    Optional<Friend> findBySenderAndReceiverAndSenderIsDeletedFalseAndReceiverIsDeletedFalse(Member sender, Member receiver);

    /* 수락되지 않은 친구 요청 (대기 요청) */
    List<Friend> findByReceiverAndIsAcceptedFalseAndSenderIsDeletedFalseAndReceiverIsDeletedFalse(Member receiver);

    /* 친구 삭제 */
    void deleteBySenderAndReceiver(Member sender, Member receiver);

    @Query("SELECT f FROM Friend f WHERE (f.sender.memberUid = :memberId OR f.receiver.memberUid = :memberId) AND f.isAccepted = true")
    List<Friend> findAcceptedFriendsByMemberId(@Param("memberId") Long memberId);
}
