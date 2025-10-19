package com.yolo.bringit.userservice.service.oauth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.ResponseDto;
import com.yolo.bringit.userservice.dto.token.TokenResponseDto;
import com.yolo.bringit.userservice.security.dto.CustomOAuth2User;
import com.yolo.bringit.userservice.security.provider.TokenProvider;
import com.yolo.bringit.userservice.util.ResponseHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final TokenProvider tokenProvider;
    private final ResponseHandler responseHandler;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        CustomOAuth2User customUser = (CustomOAuth2User) authentication.getPrincipal();
        Member member = customUser.getMember();

        TokenResponseDto.TokenInfo tokenInfo = tokenProvider.generateOAuthTokens(member);

        /*tokenInfo.setMemberInfo(MemberResponseDto.MemberInfo.builder()
                .mno(member.getMno())
                .name(member.getName())
                .email(member.getEmail())
                .role(member.getRole())
                .build());*/

        if (tokenInfo == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJsonResponse(response, responseHandler.fail("login failed.", HttpStatus.BAD_REQUEST));
            return;
        }

        response.sendRedirect("http://localhost:3000/outh-success");
    }

    private void writeJsonResponse(HttpServletResponse response, ResponseEntity<?> entity) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(entity.getStatusCodeValue());

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(entity.getBody());
        response.getWriter().write(json);
    }
}
