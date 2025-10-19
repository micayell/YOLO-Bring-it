package com.yolo.bringit.userservice.security.filter;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.security.provider.TokenProvider;
import com.yolo.bringit.userservice.security.service.UserUserDetailsService;
import com.yolo.bringit.userservice.service.member.MemberService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final MemberService memberService;
    private final UserUserDetailsService userUserDetailsService;

    private final TokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        // If header does not contain BEARER or is null delegate to Spring impl and exit
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // If header is present, try grab user principal from database and perform authorization
            Authentication authentication = getAuthentication(request);
            // jwt 토큰으로 부터 획득한 인증 정보(authentication) 설정.
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception ex) {
            // ResponseBodyWriteUtil.sendError(request, response, ex);
            // return;
        }

        filterChain.doFilter(request, response);
    }


    public Authentication getAuthentication(HttpServletRequest request) throws Exception {
        String token = request.getHeader("Authorization");
        // 요청 헤더에 Authorization 키값에 jwt 토큰이 포함된 경우에만, 토큰 검증 및 인증 처리 로직 실행.
        if (StringUtils.hasText(token) && !token.equalsIgnoreCase("null")) {

            if (tokenProvider.validateToken(token.replace("Bearer ", ""))) {
                String email = tokenProvider.validateAndGetEmail(token.replace("Bearer ", ""));
                Member member = userUserDetailsService.loadUserByUsername(email);

                AbstractAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        member,
                        null,
                        member.getAuthorities()
                );
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                securityContext.setAuthentication(authenticationToken);
                SecurityContextHolder.setContext(securityContext);

                return authenticationToken;
            }
        }
        return null;
    }

}
