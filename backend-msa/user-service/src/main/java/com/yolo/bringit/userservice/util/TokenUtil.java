package com.yolo.bringit.userservice.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Slf4j
@Component
public class TokenUtil {
    private static final String ALPHANUM =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RND = new SecureRandom();

    public String generate(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUM.charAt(RND.nextInt(ALPHANUM.length())));
        }
        return sb.toString();
    }
}
