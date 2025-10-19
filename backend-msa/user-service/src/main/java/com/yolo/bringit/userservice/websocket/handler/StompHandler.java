package com.yolo.bringit.userservice.websocket.handler;

import com.yolo.bringit.userservice.security.provider.TokenProvider;
import com.yolo.bringit.userservice.service.member.OnlineMemberService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99) // 인터셉터의 우선순의를 최상위로 설정
public class StompHandler implements ChannelInterceptor {
    @Value("${token.secret}")
    private String key;

    private final TokenProvider tokenProvider;
    private final OnlineMemberService onlineMemberService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        final StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT == accessor.getCommand()) {
            // connect 요청시 토큰 유효성 검증
            String bearerToken = accessor.getFirstNativeHeader("Authorization");

            if (StringUtils.hasText(bearerToken) && !bearerToken.equalsIgnoreCase("null")) {
                String token = bearerToken.replace("Bearer ", "");

                if (!tokenProvider.validateToken(token)) {
                    throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
                }

                Long memberId = getMemberUidFromJwt(token);

                // Spring Security의 Authentication 객체 생성 및 Security Context 등록
                Authentication authentication = new UsernamePasswordAuthenticationToken(memberId, token, null);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // WebSocket 연결에서 사용자 정보 설정 (STOMP 세션에 사용자 정보 설정)
                accessor.setUser(authentication);
                String sessionId = accessor.getSessionId();
                onlineMemberService.mapSessionToMember(sessionId, memberId);
            }

        }

        return message;
    }

    private Long getMemberUidFromJwt(String jwt) {
        try {
            Claims claims = Jwts.parser().setSigningKey(key).parseClaimsJws(jwt).getBody();

            Number memberUidNum = claims.get("memberUid", Number.class);
            return memberUidNum.longValue();
        } catch (Exception e) {
            log.error("JWT 파싱 중 오류 발생: {}", e.getMessage());
            return null;
        }
    }
}
