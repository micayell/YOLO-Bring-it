package com.yolo.bringit.userservice.service.member;

import com.yolo.bringit.userservice.domain.member.Friend;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.friend.FriendResponseDto;
import com.yolo.bringit.userservice.dto.stomp.StompDto;
import com.yolo.bringit.userservice.repository.member.FriendRepository;
import com.yolo.bringit.userservice.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {
    private final FriendRepository friendRepository;
    private final MemberRepository memberRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final OnlineMemberService onlineMemberService;

    @Override
    @Transactional
    public FriendResponseDto.FriendInfo sendFriendRequest(Member sender, Long receiverId) {
        Member receiver = memberRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("수신자 정보를 찾을 수 없습니다."));

        friendRepository.findBySenderAndReceiverAndSenderIsDeletedFalseAndReceiverIsDeletedFalse(sender, receiver)
                .ifPresent(f -> {
                    throw new IllegalStateException("이미 친구 요청을 보냈습니다.");
                });

        Friend friend = Friend.builder()
                .sender(sender)
                .receiver(receiver)
                .build();

        Friend savedFriend = friendRepository.save(friend);

        // webSocket
        StompDto.FriendNotificationDto notification = StompDto.FriendNotificationDto.builder()
                .senderId(sender.getMemberUid())
                .senderNickname(sender.getNickname())
                .message(sender.getNickname() + "님이 친구 요청을 보냈습니다.")
                .build();

        simpMessagingTemplate.convertAndSend("/topic/friends/" + receiverId, notification);

        return FriendResponseDto.FriendInfo.from(savedFriend, sender.getMemberUid());
    }

    @Override
    @Transactional
    public FriendResponseDto.FriendInfo acceptFriendRequest(Long senderId, Member receiver) {
        Member sender = memberRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("보낸 사람 정보를 찾을 수 없습니다."));

        Friend friend = friendRepository.findBySenderAndReceiverAndSenderIsDeletedFalseAndReceiverIsDeletedFalse(sender, receiver)
                .orElseThrow(() -> new IllegalArgumentException("해당 친구 요청이 존재하지 않습니다."));

        if (!friend.getReceiver().equals(receiver)) {
            throw new SecurityException("수락 권한이 없습니다.");
        }
        if (Boolean.TRUE.equals(friend.getIsAccepted())) {
            throw new IllegalStateException("이미 수락된 요청입니다.");
        }

        StompDto.FriendNotificationDto notification = StompDto.FriendNotificationDto.builder()
                .senderId(receiver.getMemberUid())
                .senderNickname(receiver.getNickname())
                .message(receiver.getNickname() + "님이 친구 요청을 수락했습니다.")
                .build();

        simpMessagingTemplate.convertAndSend("/topic/friends/" + senderId, notification);

        friend.setIsAccepted(true);
        return FriendResponseDto.FriendInfo.from(friend, receiver.getMemberUid());
    }

    @Override
    @Transactional
    public void deleteFriend(Member member, Long otherId) {
        Member target = memberRepository.findById(otherId)
                .orElseThrow(() -> new IllegalArgumentException("친구 정보를 찾을 수 없습니다."));
        friendRepository.deleteBySenderAndReceiver(member, target);
        friendRepository.deleteBySenderAndReceiver(target, member);
    }

    @Override
    public List<FriendResponseDto.FriendInfoWithOnline> getFriendList(Member member) {
        return friendRepository.findAcceptedFriends(member).stream()
                .map(friend -> {
                    Member other = friend.getSender().getMemberUid().equals(member.getMemberUid())
                            ? friend.getReceiver()
                            : friend.getSender();
                    boolean isOnline = onlineMemberService.isOnline(other.getMemberUid());

                    return FriendResponseDto.FriendInfoWithOnline.from(friend, member.getMemberUid(), isOnline);
                })
                .toList();
    }

    @Override
    public List<FriendResponseDto.FriendInfo> getPendingRequests(Member member) {
        return friendRepository.findByReceiverAndIsAcceptedFalseAndSenderIsDeletedFalseAndReceiverIsDeletedFalse(member).stream()
                .map(friend -> FriendResponseDto.FriendInfo.from(friend, member.getMemberUid()))
                .toList();
    }

    @Override
    public List<FriendResponseDto.SearchFriendInfo> searchFriendsByNickname(Member member, String nickname) {
        return friendRepository.searchFriendsByNickname(member, nickname).stream()
                .map(FriendResponseDto.SearchFriendInfo::from)
                .toList();
    }
}
