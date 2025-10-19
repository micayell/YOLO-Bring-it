package com.yolo.bringit.userservice.service.member;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.friend.FriendResponseDto;

import java.util.List;

public interface FriendService {
    /* 친구 추가 요청 */
    FriendResponseDto.FriendInfo sendFriendRequest(Member sender, Long receiverId);

    /* 친구 추가 요청 수락 */
    FriendResponseDto.FriendInfo acceptFriendRequest(Long senderId, Member receiver);

    /* 친구 삭제 */
    void deleteFriend(Member a, Long otherId);

    /* 친구 목록 조회 */
    List<FriendResponseDto.FriendInfoWithOnline> getFriendList(Member member);

    /* 친구 추가 요청 목록 조회 */
    List<FriendResponseDto.FriendInfo> getPendingRequests(Member member);

    List<FriendResponseDto.SearchFriendInfo> searchFriendsByNickname(Member member, String nickname);
}
