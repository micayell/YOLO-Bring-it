
package com.yolo.bringit.gameservice.websocket.handler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
//@Component
//@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {
/*    @Value("${app.jwt.secret}")
    private String key;
    private final TokenProvider tokenProvider;
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
            }
        }
        return message;
    }*/
}