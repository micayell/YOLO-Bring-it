package com.yolo.bringit.userservice.repository.member;

import com.yolo.bringit.userservice.domain.member.OnlineMember;
import org.springframework.data.repository.CrudRepository;

public interface OnlineMemberRepository extends CrudRepository<OnlineMember, Long> {
    boolean existsByMemberId(Long memberId);
}
