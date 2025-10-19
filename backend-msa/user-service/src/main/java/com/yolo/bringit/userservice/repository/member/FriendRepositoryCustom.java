package com.yolo.bringit.userservice.repository.member;

import com.yolo.bringit.userservice.domain.member.Friend;
import com.yolo.bringit.userservice.domain.member.Member;

import java.util.List;

public interface FriendRepositoryCustom {

    /* 친구 목록 조회 */
    List<Friend> findAcceptedFriends(Member member);

    /* 친구 목록에서 닉네임으로 검색 */
    List<Member> searchFriendsByNickname(Member member, String nickname);
}
