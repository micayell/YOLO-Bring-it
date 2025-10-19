package com.yolo.bringit.userservice.service.token;

public interface StaleTokenService {
    void writeTokenInfo(String accessToken);
}
