package com.yolo.bringit.apigatewayservice.filter;

import com.yolo.bringit.apigatewayservice.repository.token.StaleTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@Slf4j
public class AuthorizationHeaderFilter extends AbstractGatewayFilterFactory<AuthorizationHeaderFilter.Config> {
    Environment env;
    StaleTokenRepository staleTokenRepository;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private static final List<String> WHITE_LIST = List.of(
            "/ws-chat/**"
    );

    public AuthorizationHeaderFilter(Environment env, StaleTokenRepository staleTokenRepository) {
        super(Config.class);
        this.env = env;
        this.staleTokenRepository = staleTokenRepository;
    }

    public static class Config {

    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // 웹소켓 관련 경로는 Authorization 헤더 사용 불가
            String path = exchange.getRequest().getURI().getPath();
            if (WHITE_LIST.stream().anyMatch(pattern -> pathMatcher.match(pattern, path))) {
                log.info("AuthorizationHeaderFilter Skipped (white list): {}", path);
                return chain.filter(exchange);
            }
            if (request.getMethod() == HttpMethod.OPTIONS) {
                return chain.filter(exchange);
            }

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "No authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authorizationHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            String jwt = authorizationHeader.replace("Bearer ", "");

            if (staleTokenRepository.findByAccessToken(jwt).isPresent()) {
                return onError(exchange, "JWT token is not valid", HttpStatus.UNAUTHORIZED);
            }

            if (!isJwtValid(jwt)) {
                return onError(exchange, "JWT token is not valid", HttpStatus.UNAUTHORIZED);
            }

            String memberUid = getMemberUidFromJwt(jwt);
            if (memberUid == null) {
                return onError(exchange, "Invalid member UID", HttpStatus.UNAUTHORIZED);
            }

            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-MEMBER-UID", memberUid)
                    .build();

            // return chain.filter(exchange);
            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    private String getMemberUidFromJwt(String jwt) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(env.getProperty("token.secret"))
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            return claims.get("memberUid").toString();

        } catch (Exception e) {
            log.error("JWT 파싱 중 오류 발생: {}", e.getMessage());
            return null;
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);

        log.error(err);
        return response.setComplete();
    }

    private boolean isJwtValid(String jwt) {
        String secret = env.getProperty("token.secret");

        if (secret == null || secret.isEmpty()) {
            log.error("token.secret 값이 설정되지 않았습니다.");
            return false;
        }

        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secret)
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            long expirationTimeMillis = claims.getExpiration().getTime();
            long currentTimeMillis = System.currentTimeMillis();

            if (expirationTimeMillis < currentTimeMillis) {
                log.debug("JWT가 만료되었습니다.");
                return false;
            }

            return true;

        } catch (Exception e) {
            log.debug("JWT 검증 중 오류 발생: {}", e.getMessage());
            return false;
        }
    }
}
