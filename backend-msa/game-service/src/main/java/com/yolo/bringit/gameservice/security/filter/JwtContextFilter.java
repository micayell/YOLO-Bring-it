package com.yolo.bringit.gameservice.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtContextFilter extends OncePerRequestFilter {

    public static final ThreadLocal<String> TOKEN_HOLDER = new ThreadLocal<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            TOKEN_HOLDER.set(token);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TOKEN_HOLDER.remove(); // 메모리 누수 방지
        }
    }
}
