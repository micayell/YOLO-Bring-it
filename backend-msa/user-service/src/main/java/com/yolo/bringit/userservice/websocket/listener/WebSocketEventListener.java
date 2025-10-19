package com.yolo.bringit.userservice.websocket.listener;

import com.yolo.bringit.userservice.domain.member.Friend;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.repository.member.FriendRepository;
import com.yolo.bringit.userservice.security.provider.TokenProvider;
import com.yolo.bringit.userservice.service.member.OnlineMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final OnlineMemberService onlineMemberService;
    private final FriendRepository friendRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final TokenProvider tokenProvider;

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String token = accessor.getFirstNativeHeader("Authorization");

        if (StringUtils.hasText(token) && !token.equalsIgnoreCase("null")) {
            token = token.replace("Bearer ", "");

            if (!tokenProvider.validateToken(token)) {
                throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
            }

            Long memberId = tokenProvider.getUserId(token);
            onlineMemberService.setOnline(memberId);

            System.out.println("[handleConnect] memberId = " + memberId);

            // 친구들에게 온라인 알림 전송
            List<Friend> friends = friendRepository.findAcceptedFriendsByMemberId(memberId);
            for (Friend friend : friends) {
                Long friendId = getOtherMember(friend, memberId).getMemberUid();
                System.out.println("소켓 메시지 발행함: memberId = " + memberId);

                messagingTemplate.convertAndSend(
                        "/topic/friends/online-status",
                        Map.of("memberId", memberId, "isOnline", true)
                );
            }
        }
    }


    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        Long memberId = onlineMemberService.getMemberIdBySessionId(sessionId);
        if (memberId != null) {
            onlineMemberService.setOffline(memberId);
            onlineMemberService.removeSession(sessionId); // 제거
            System.out.println("[handleDisConnect] memberId = " + memberId);
            // 친구들에게 오프라인 알림
            List<Friend> friends = friendRepository.findAcceptedFriendsByMemberId(memberId);
            for (Friend friend : friends) {
                Long friendId = getOtherMember(friend, memberId).getMemberUid();

                messagingTemplate.convertAndSend(
                        "/topic/friends/online-status",
                        Map.of("memberId", memberId, "isOnline", false)
                );
            }
        } else {
            System.out.println("[handleDisconnect] sessionId로 memberId 찾을 수 없음");
        }
    }



    private Member getOtherMember(Friend friend, Long myId) {
        return friend.getSender().getMemberUid().equals(myId)
                ? friend.getReceiver()
                : friend.getSender();
    }
}
