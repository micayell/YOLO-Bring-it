package com.yolo.bringit.chatservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private final TokenProvider tokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // CONNECT 아니면 인증 확인 X
        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        // 헤더에서 JWT 토큰 추출 (Null-safe)
        String token = Optional.ofNullable(accessor.getNativeHeader("Authorization"))
                .map(headers -> headers.get(0))
                .map(bearerToken -> bearerToken.replace("Bearer ", ""))
                .orElse(null);

        if (token != null && tokenProvider.validateToken(token)) {
            String memberId = tokenProvider.getMemberId(token);
            Authentication authentication = new UsernamePasswordAuthenticationToken(memberId, token, null);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            accessor.setUser(authentication);
        } else {
            log.warn("STOMP connection failed: Invalid JWT token");
            throw new IllegalArgumentException("Invalid JWT token");
        }

        return message;
    }
}