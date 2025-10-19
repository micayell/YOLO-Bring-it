package com.yolo.bringit.userservice.controller;

import com.yolo.bringit.userservice.dto.ResponseDto;
import com.yolo.bringit.userservice.dto.email.EmailRequestDto;
import com.yolo.bringit.userservice.dto.member.MemberRequestDto;
import com.yolo.bringit.userservice.dto.token.TokenRequestDto;
import com.yolo.bringit.userservice.dto.token.TokenResponseDto;
import com.yolo.bringit.userservice.service.member.MemberService;
import com.yolo.bringit.userservice.service.token.RefreshTokenService;
import com.yolo.bringit.userservice.service.token.StaleTokenService;
import com.yolo.bringit.userservice.service.token.VerificationTokenService;
import com.yolo.bringit.userservice.util.ErrorUtil;
import com.yolo.bringit.userservice.util.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/tokens")
public class TokenController {
    private final MemberService memberService;
    private final RefreshTokenService refreshTokenService;
    private final StaleTokenService staleTokenService;
    private final VerificationTokenService verificationTokenService;

    private final ErrorUtil errorUtil;
    private final ResponseHandler responseHandler;

    @Operation(summary = "로그인", description = "로그인을 진행합니다.")
    @PostMapping(value = "/login")
    public ResponseEntity<?> login(@RequestBody @Validated MemberRequestDto.Login memberLoginRequestDto, HttpServletResponse response, Errors errors) {
        if (errors.hasErrors()) {
            return responseHandler.invalidData(errorUtil.flatErrors(errors));
        }

        try {
            TokenResponseDto.TokenInfo tokenInfo = memberService.login(memberLoginRequestDto);

            if (tokenInfo == null) {
                return responseHandler.fail("login failed.", HttpStatus.BAD_REQUEST);
            }

            return responseHandler.success(tokenInfo);
        } catch (Exception e) {
            log.debug("login error occurred!");
            return responseHandler.fail("server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "로그아웃", description = "로그아웃을 진행합니다.")
    @PostMapping(value = "/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("토큰이 유효하지 않습니다.");
        }

        String accessToken = header.replace("Bearer ", "").trim();

        if (accessToken != null && !accessToken.isEmpty()) {
            staleTokenService.writeTokenInfo(accessToken); // stale token 등록
            refreshTokenService.removeRefreshToken(accessToken);

            return responseHandler.success("logout success ");
        }

        return responseHandler.fail("logout failed", HttpStatus.BAD_REQUEST);
    }

    @Operation(summary = "이메일 인증 코드 발송", description = "이메일로 인증 코드를 발송합니다.")
    @PostMapping("/signup/email")
    public ResponseEntity<?> sendSignUpCode(@RequestBody @Valid EmailRequestDto.SignUpEmail request) {
        try {
            verificationTokenService.sendSignUpCode(request.getEmail());
            return responseHandler.success(HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return responseHandler.fail(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("sendSignUpCode error", e);
            return responseHandler.fail("인증 코드 발송 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "인증 코드 검증", description = "이메일 인증 코드를 검증합니다.")
    @PostMapping("/verification")
    public ResponseEntity<?> verifyCode(@RequestBody @Valid TokenRequestDto.Verify request) {
        verificationTokenService.verifyCode(request.getEmail(), request.getCode());
        TokenResponseDto.VerifyInfo body = new TokenResponseDto.VerifyInfo(true);
        return responseHandler.success(body);
    }

    @Operation(summary = "리프레시 토큰 재발급", description = "리프레시 토큰을 재발급합니다.")
    @PostMapping(value = "/reissue")
    public ResponseEntity<?> reissue(@RequestBody TokenRequestDto.Reissue reissueDto) {
        try {
            String refreshToken = reissueDto.getRefreshToken();

            String accessToken = refreshTokenService.reissue(refreshToken);
            if (accessToken == null) {
                return responseHandler.fail("reissue failed.", HttpStatus.BAD_REQUEST);
            }

            return responseHandler.success(TokenResponseDto.ReissueInfo.builder()
                    .accessToken(accessToken)
                    .build());

        } catch (Exception e) {
            log.debug("reissue error occurred!");
            return responseHandler.fail("server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
