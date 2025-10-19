package com.yolo.bringit.gameservice.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;

@Slf4j
@Component
public class TokenProvider {

    @Value("${token.secret}")
    private String secret;

    private Key key;

    @PostConstruct
    public void init() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (IllegalArgumentException e) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    private String normalize(String token) {
        if (token == null) return null;
        token = token.trim();
        return token.startsWith("Bearer ") ? token.substring(7).trim() : token;
    }

    public boolean validateToken(String rawToken) {
        try {
            String token = normalize(rawToken);
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .setAllowedClockSkewSeconds(60) // 시계 오차 허용
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("[JWT] expired: {}", e.getMessage());
        } catch (UnsupportedJwtException | MalformedJwtException | SecurityException e) {
            log.warn("[JWT] invalid: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("[JWT] empty/illegal: {}", e.getMessage());
        }
        return false;
    }

    public String getMemberId(String rawToken) {
        Claims claims = getAllClaims(rawToken);
        if (claims == null) return null;

        Object id = claims.get("memberId");
        if (id == null) id = claims.get("memberUid");
        if (id == null) id = claims.get("id");
        if (id != null) return String.valueOf(id);

        // 없으면 sub(subject) 사용 (email 등)
        return claims.getSubject();
    }

    private Claims getAllClaims(String rawToken) {
        try {
            String token = normalize(rawToken);
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("[JWT] parse failed: {}", e.getMessage());
            return null;
        }
    }
}
