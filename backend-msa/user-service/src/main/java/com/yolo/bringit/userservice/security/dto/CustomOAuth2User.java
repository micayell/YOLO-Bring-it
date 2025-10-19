package com.yolo.bringit.userservice.security.dto;

import com.yolo.bringit.userservice.domain.member.Member;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import java.util.List;
import java.util.Map;

public class CustomOAuth2User extends DefaultOAuth2User {
    private final Member member;

    public CustomOAuth2User(List<? extends GrantedAuthority> authorities, Map<String, Object> attributes,
                            String nameAttributeKey, Member member) {
        super(authorities, attributes, nameAttributeKey);
        this.member = member;
    }

    public Member getMember() {
        return member;
    }

}