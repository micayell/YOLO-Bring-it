package com.yolo.bringit.userservice.dto.friend;

import com.yolo.bringit.userservice.domain.member.Friend;
import com.yolo.bringit.userservice.domain.member.Member;
import lombok.AllArgsConstructor;
import lombok.Getter;

public class FriendResponseDto {
    /**
     * 친구 요청/목록 조회 응답 DTO
     */
    @Getter
    @AllArgsConstructor
    public static class FriendInfo {
        private Long memberId; // 상대방 ID
        private Boolean isAccepted;
        private Integer xp;
        private String nickname;

        public static FriendInfo from(Friend friend, Long currentId) {
            Member other = friend.getSender().getMemberUid().equals(currentId)
                    ? friend.getReceiver()
                    : friend.getSender();
            return new FriendInfo(other.getMemberUid(), friend.getIsAccepted(), other.getXp(), other.getNickname());
        }
    }

    @Getter
    @AllArgsConstructor
    public static class FriendInfoWithOnline {
        private Long friendUid;
        private Long memberId; // 상대방 ID
        private Boolean isAccepted;
        private boolean isOnline;

        public static FriendInfoWithOnline from(Friend friend, Long currentId, Boolean isOnline) {
            Member other = friend.getSender().getMemberUid().equals(currentId)
                    ? friend.getReceiver()
                    : friend.getSender();
            return new FriendInfoWithOnline(friend.getFriendUid(), other.getMemberUid(), friend.getIsAccepted(), isOnline);
        }
    }


    /**
     * 닉네임 검색 결과 응답 DTO
     */
    @Getter
    @AllArgsConstructor
    public static class SearchFriendInfo {
        private Long memberId;
        private String nickname;

        public static SearchFriendInfo from(Member member) {
            return new SearchFriendInfo(member.getMemberUid(), member.getNickname());
        }
    }
}
