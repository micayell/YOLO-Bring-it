package com.yolo.bringit.userservice.config.security;

import com.yolo.bringit.userservice.security.filter.JwtAuthenticationFilter;
import com.yolo.bringit.userservice.security.provider.TokenProvider;
import com.yolo.bringit.userservice.security.service.UserUserDetailsService;
import com.yolo.bringit.userservice.service.member.MemberService;
import com.yolo.bringit.userservice.service.oauth.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.autoconfigure.security.ConditionalOnDefaultWebSecurity;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@EnableWebSecurity
@RequiredArgsConstructor
@Configuration
@ConditionalOnDefaultWebSecurity
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class SecurityConfig {
    /*@Value("${app.front.url}")
    private String frontUrl;*/
    public static final String[] PUBLIC_URLS = { "/**" };

    private final OAuth2UserService oAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(
            MemberService memberService,
            UserUserDetailsService userUserDetailsService,
            TokenProvider tokenProvider) {
        return new JwtAuthenticationFilter(memberService, userUserDetailsService, tokenProvider);
    }

    @Bean
    @Order(SecurityProperties.BASIC_AUTH_ORDER)
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .httpBasic(basic->basic.disable())
                .sessionManagement(configurer->configurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                //.cors(cors->cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authorizeRequests->
                        authorizeRequests
                                /*.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/actuator/**", "/h2-console/**", "/health-check", "/tokens/**", "/actuator/**").permitAll() // 공개 경로
                                .requestMatchers("/users/**", "/v1/rooms/**", "/blocked-members/**")
                                .hasAnyRole("USER", "ADMIN")*/
                                .requestMatchers(PUBLIC_URLS).permitAll()
                                //.requestMatchers("/ws/**", "/connect/**").authenticated()
                                .anyRequest().authenticated()
                )
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.disable()) // H2 Console 프레임 보호 비활성화
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(user -> user.userService(oAuth2UserService))
                        .successHandler(oAuth2SuccessHandler)
                )
                .addFilterAfter(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowCredentials(false);
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers(PathRequest.toStaticResources().atCommonLocations());
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}