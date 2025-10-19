package com.yolo.bringit.userservice.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {
    //@Override
    //protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
    //    messages
    //            .nullDestMatcher().permitAllF()
    //            .simpDestMatchers("/app/auth").authenticated()
    //            .simpSubscribeDestMatchers("/topic/**", "/**/queue/**").authenticated()
    //            .simpDestMatchers("/connect/**").authenticated()
    //            .anyMessage().denyAll();
    //}


    @Override
    protected boolean sameOriginDisabled() {
        return true;
    }

    //@Bean
    //public WebSecurityCustomizer webSecurityCustomizer() {
    //    return web -> web
    //            .ignoring()
    //            .requestMatchers("/reservation/*/lookup/join");
    //}

    //@Override
    //public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
    //    registry.setMessageSizeLimit(64 * 1024);  // 메시지 크기 설정
    //    registry.setSendBufferSizeLimit(512 * 1024); // 전송 버퍼 크기 설정
    //    registry.setSendTimeLimit(20 * 1000); // 전송 타임아웃 설정
    //}

}
