package com.yolo.bringit.gameservice.service.liveKit;

import com.yolo.bringit.gameservice.client.UserServiceClient;
import com.yolo.bringit.gameservice.dto.client.ClientResponseDto;
import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiveKitServiceImpl implements LiveKitService {

    @Value("${livekit.api.key}")
    private String apiKey;
    @Value("${livekit.api.secret}")
    private String apiSecret;

    private final UserServiceClient userServiceClient;
    private final CircuitBreakerFactory circuitBreakerFactory;

    public String createToken(String roomName, Long userId) {
        try {
            CircuitBreaker circuitBreaker = circuitBreakerFactory.create("circuitbreaker");
            ClientResponseDto.MemberInfo memberInfo = circuitBreaker.run(() -> userServiceClient.getMember(userId).getData(),
                    throwable -> ClientResponseDto.MemberInfo.builder().build());

            AccessToken token = new AccessToken(apiKey, apiSecret);
            token.setIdentity(userId.toString());
            token.setName(memberInfo.getNickname());
            token.addGrants(new RoomJoin(true), new RoomName(roomName));
            return token.toJwt();
        } catch(Exception e) {
            throw new RuntimeException("LiveKit 토큰 생성 실패", e);
        }
    }
}
