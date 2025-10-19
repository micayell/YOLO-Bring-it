package com.yolo.bringit.gameservice.config.webSocket;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class StompWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.front.url}")
    private String frontUrl;

    //private final StompHandler stompHandler;

    /*public StompWebSocketConfig(StompHandler stompHandler) {
        this.stompHandler = stompHandler;
    }*/

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // /topic/1 형태로 메시지를 수신
        config.enableSimpleBroker("/topic");

        // /publish/1 형태로 메시지 발행
        // -> /publish로 시작하는 url 패턴으로 메시지가 발행되면 @Controller 객체의 @MessageMapping 메서드로 라우팅
        config.setApplicationDestinationPrefixes("/publish");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-game")

                // websocket 프로토콜에 대한 요청에 대해서는 별도의 cors 설정 필요
                .setAllowedOrigins(frontUrl)
                // ws://가 아닌 http:// 엔드포인트를 사용할 수 있게 해주는 sockJs 라이브러리(front)를 통한 요청을 허용
                .withSockJS(); // fallback
    }

    /*@Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // 웹소켓 요청(connect, subscribe, disconnect) 등의 요청시에는 http 헤더 등 http 메시지를 넣어올 수 있음
        // 이를 interceptor를 통해 가로채 토큰 등을 검증할 수 있다.
        registration.interceptors(stompHandler);
    }*/
}
