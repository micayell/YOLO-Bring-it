package com.yolo.bringit.chatservice.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class StompWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.front.url}")
    private String[] frontUrls;

    @Value("${spring.rabbitmq.host}")
    private String rabbitHost;

    @Value("${spring.rabbitmq.username}")
    private String rabbitUser;

    @Value("${spring.rabbitmq.password}")
    private String rabbitPassword;

    private final int stompPort = 61613;

    private final StompHandler stompHandler;

    public StompWebSocketConfig(StompHandler stompHandler) {
        this.stompHandler = stompHandler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableStompBrokerRelay("/topic", "/queue") // 외부 RabbitMQ relay
                .setRelayHost(rabbitHost)
                .setRelayPort(stompPort)
                .setClientLogin(rabbitUser)
                .setClientPasscode(rabbitPassword)
                .setSystemHeartbeatSendInterval(10_000)
                .setSystemHeartbeatReceiveInterval(10_000)
                .setUserDestinationBroadcast("/topic/unresolved-user-dest")
                .setUserRegistryBroadcast("/topic/registry");

        config.setApplicationDestinationPrefixes("/publish"); // 클라이언트 -> 서버 메시지 prefix
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns(frontUrls)
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompHandler);
    }
}