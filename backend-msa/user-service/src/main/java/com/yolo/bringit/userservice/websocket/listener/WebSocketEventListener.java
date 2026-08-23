package com.yolo.bringit.userservice.websocket.listener;

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

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final OnlineMemberService onlineMemberService;
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
            System.out.println("소켓 메시지 발행함: memberId = " + memberId);

            // 공용 채널을 통해 접속 알림 1번만 전송
            messagingTemplate.convertAndSend(
                    "/topic/friends/online-status",
                    Map.of("memberId", memberId, "isOnline", true)
            );
        }
    }


    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        Long memberId = onlineMemberService.getMemberIdBySessionId(sessionId);
        if (memberId != null) {
            onlineMemberService.removeSession(sessionId); // 먼저 세션 제거

            if (!onlineMemberService.hasActiveSessions(memberId)) {
                onlineMemberService.setOffline(memberId);
                System.out.println("[handleDisConnect] memberId = " + memberId);

                // 공용 채널을 통해 종료 알림 1번만 전송
                messagingTemplate.convertAndSend(
                        "/topic/friends/online-status",
                        Map.of("memberId", memberId, "isOnline", false)
                );
            }

        } else {
            System.out.println("[handleDisconnect] sessionId로 memberId 찾을 수 없음");
        }
    }
}
