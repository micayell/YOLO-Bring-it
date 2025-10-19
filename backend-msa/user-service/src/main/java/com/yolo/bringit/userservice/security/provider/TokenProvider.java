package com.yolo.bringit.userservice.security.provider;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.token.TokenResponseDto;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class TokenProvider {
    @Value("${token.secret}")
    private String key;
    private static final String AUTHORITIES_KEY = "auth";
    private static final long ACCESS_TOKEN_EXPIRE_TIME = 60 * 60 * 1000L; // 60분
    private static final long REFRESH_TOKEN_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000L;  // 7일

    public TokenResponseDto.TokenInfo generateTokens(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        Date accessTokenExpiresIn = new Date(now + ACCESS_TOKEN_EXPIRE_TIME);

        Member member = (Member) authentication.getPrincipal();

        String accessToken = Jwts.builder()
                .signWith(SignatureAlgorithm.HS512, key)
                .setSubject(member.getEmail())
                .claim("memberUid", member.getMemberUid())
                .claim(AUTHORITIES_KEY, authorities)
                .setIssuer("yolo bring it")
                .setIssuedAt(new Date())
                .setExpiration(accessTokenExpiresIn)
                .compact();

        String refreshToken = Jwts.builder()
                .setExpiration(new Date(now + REFRESH_TOKEN_EXPIRE_TIME))
                .signWith(SignatureAlgorithm.HS512, key)
                .setIssuer("yolo bring it")
                .compact();

        return TokenResponseDto.TokenInfo.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpirationTime(ACCESS_TOKEN_EXPIRE_TIME)
                .refreshTokenExpirationTime(REFRESH_TOKEN_EXPIRE_TIME)
                .build();
    }

    public TokenResponseDto.TokenInfo generateOAuthTokens(Member member) {

        long now = (new Date()).getTime();

        String authorities = String.join(",", member.getRoles());
        Date accessTokenExpiresIn = new Date(now + ACCESS_TOKEN_EXPIRE_TIME);

        String accessToken = Jwts.builder()
                .signWith(SignatureAlgorithm.HS512, key)
                .setSubject(member.getEmail())
                .claim("memberUid", member.getMemberUid())
                .claim(AUTHORITIES_KEY, authorities)
                .setIssuer("yolo bring it")
                .setIssuedAt(new Date())
                .setExpiration(accessTokenExpiresIn)
                .compact();

        String refreshToken = Jwts.builder()
                .setExpiration(new Date(now + REFRESH_TOKEN_EXPIRE_TIME))
                .signWith(SignatureAlgorithm.HS512, key)
                .setIssuer("yolo bring it")
                .compact();

        return TokenResponseDto.TokenInfo.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpirationTime(ACCESS_TOKEN_EXPIRE_TIME)
                .refreshTokenExpirationTime(REFRESH_TOKEN_EXPIRE_TIME)
                .build();
    }

    public String generateAccessToken(Member member) {
        String authorities = member.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        Date accessTokenExpiresIn = new Date(now + ACCESS_TOKEN_EXPIRE_TIME);
        String accessToken = Jwts.builder()
                .signWith(SignatureAlgorithm.HS512, key)
                .setSubject(member.getEmail())
                .claim("memberUid", member.getMemberUid())
                .claim(AUTHORITIES_KEY, authorities)
                .setIssuer("yolo bring it")
                .setIssuedAt(new Date())
                .setExpiration(accessTokenExpiresIn)
                .compact();
        return accessToken;
    }

    public String validateAndGetEmail(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(key)
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = Jwts.parser().setSigningKey(key).parseClaimsJws(token).getBody();
            long expirationTimeMillis = claims.getExpiration().getTime();
            long currentTimeMillis = System.currentTimeMillis();

            if (expirationTimeMillis < currentTimeMillis) {
                // token is expired
                return false;
            }

            return true;
        } catch (Exception e) {
            log.debug("validateToken error");
        }
        return false;
    }

    public Long getUserId(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(key)
                .parseClaimsJws(token)
                .getBody();

        Object memberId = claims.get("memberUid");
        if (memberId instanceof Integer) {
            return ((Integer) memberId).longValue();
        } else if (memberId instanceof Long) {
            return (Long) memberId;
        } else if (memberId instanceof String) {
            return Long.parseLong((String) memberId);
        } else {
            throw new IllegalArgumentException("memberId claim is missing or invalid");
        }
    }
}
