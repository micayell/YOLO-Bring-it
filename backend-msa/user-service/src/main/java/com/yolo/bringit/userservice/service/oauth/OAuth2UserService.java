package com.yolo.bringit.userservice.service.oauth;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.repository.member.MemberRepository;
import com.yolo.bringit.userservice.security.dto.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {
    private final MemberRepository memberRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Role generate
        List<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList("ROLE_USER");

        // nameAttributeKey
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();

        Map<String, Object> attributes = oAuth2User.getAttributes();
        Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        String email = (String) kakaoAccount.get("email");

        // DB 저장로직 추가
        Optional<Member> optionalMember = memberRepository.findByEmail(email);
        if (optionalMember.isEmpty()) { // member가 존재하지 않음 -> member 저장
            memberRepository.save(Member.builder()
                    .name((String) properties.get("nickname"))
                    .roles(Arrays.asList("ROLE_USER"))
                    .email(email)
                    .build());
        }

        return new CustomOAuth2User(authorities, attributes, userNameAttributeName, optionalMember.get());
    }
}
