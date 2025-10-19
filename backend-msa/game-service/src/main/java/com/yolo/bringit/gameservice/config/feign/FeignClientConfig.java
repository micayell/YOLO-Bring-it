package com.yolo.bringit.gameservice.config.feign;

import com.yolo.bringit.gameservice.security.filter.JwtContextFilter;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            String token = JwtContextFilter.TOKEN_HOLDER.get();
            if (token != null && token.startsWith("Bearer ")) {
                template.header("Authorization", token);
            }
        };
    }
}
