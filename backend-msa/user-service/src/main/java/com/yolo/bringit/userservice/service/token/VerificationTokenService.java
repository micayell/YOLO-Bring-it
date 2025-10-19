package com.yolo.bringit.userservice.service.token;

public interface VerificationTokenService {
    void sendSignUpCode(String email);

    void verifyCode(String email, String code);
}
