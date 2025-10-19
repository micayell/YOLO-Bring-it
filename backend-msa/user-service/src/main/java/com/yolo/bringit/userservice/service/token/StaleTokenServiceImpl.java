package com.yolo.bringit.userservice.service.token;

import com.yolo.bringit.userservice.domain.token.StaleToken;
import com.yolo.bringit.userservice.repository.token.StaleTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaleTokenServiceImpl implements StaleTokenService {
    private final StaleTokenRepository staleTokenRepository;

    @Override
    @Transactional
    public void writeTokenInfo(String accessToken) {
        staleTokenRepository.save(StaleToken.builder()
                        .accessToken(accessToken)
                        .build());
    }
}
