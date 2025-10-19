package com.yolo.bringit.chatservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    public static final String[] PUBLIC_URLS = {"/**"};
    @Value("${app.front.url}")
    private String frontUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .httpBasic(basic->basic.disable())
//                .sessionManagement(configurer->configurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
////                .cors(cors->cors.configurationSource(corsConfigurationSource()))
//                .authorizeHttpRequests(authorizeRequests->
//                        authorizeRequests
//                                .requestMatchers(PUBLIC_URLS).permitAll()
//                                .anyRequest().authenticated()
//                );
////                .addFilterAfter(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/swagger-ui/**", "/v3/api-docs/**", "/actuator/**",
                                "/chats/**", "/ws-chat/**",
                                "/topic/**", "/queue/**", "/publish/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }

}