package com.yolo.bringit.userservice.controller;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.domain.password.PasswordResetToken;
import com.yolo.bringit.userservice.dto.email.EmailResponseDto;
import com.yolo.bringit.userservice.dto.member.MemberRequestDto;
import com.yolo.bringit.userservice.dto.member.MemberResponseDto;
import com.yolo.bringit.userservice.service.member.MemberService;
import com.yolo.bringit.userservice.service.member.OnlineMemberService;
import com.yolo.bringit.userservice.service.password.PasswordResetTokenService;
import com.yolo.bringit.userservice.util.EmailUtil;
import com.yolo.bringit.userservice.util.ResponseHandler;
import com.yolo.bringit.userservice.util.TokenUtil;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class MemberController {
    private final Environment env;
    private final MemberService memberService;
    private final PasswordResetTokenService passwordResetTokenService;

    private final ResponseHandler responseHandler;
    private final EmailUtil emailUtil;
    private final TokenUtil tokenUtil;
    private final OnlineMemberService onlineMemberService;

    @Operation(summary = "상태 체크", description = "서버가 살아있는지 확인합니다.")
    @GetMapping("/health-check")
    public String status() {
        return String.format("It's Working in User Service"
        + ", port(local.server.port)="+env.getProperty("local.server.port")
        + ", port(server.port)="+env.getProperty("server.port"));
    }

    @Operation(summary = "회원가입", description = "회원가입을 진행합니다.")
    @PostMapping
    public ResponseEntity<?> join(@RequestBody @Valid MemberRequestDto.SignUp request) {
        try {
            memberService.signUp(request);
            return responseHandler.success(HttpStatus.CREATED);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return responseHandler.fail(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("signUp error", e);
            // ✅ 모든 종류의 에러 원인을 메시지로 반환하여 프론트에서 원인을 확인할 수 있도록 임시 수정
            return responseHandler.fail("서버 에러 원인: " + e.getMessage() + " / " + e.getClass().getSimpleName(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "회원 단일 조회", description = "회원 단일 조회를 진행합니다.")
    @GetMapping("/{member-id}")
    public ResponseEntity<?> getMember(@PathVariable("member-id") Long memberId) {
        try {
            Member member = memberService.getMemberById(memberId).orElseThrow(
                    () -> new RuntimeException("해당 유저가 없습니다.")
            );

            String char2dpath = memberService.getEquipped2dCharacterPath(memberId);
            String char3dpath = memberService.getEquipped3dCharacterPath(memberId);
            String badgename = memberService.getEquippedBadgeName(memberId);
            String titlepath = memberService.getEquippedTitlePath(memberId);

            return responseHandler.success(MemberResponseDto.MemberInfo.builder()
                    .memberUid(member.getMemberUid())
                    .email(member.getEmail())
                    .name(member.getName())
                    .nickname(member.getNickname())
                    .intro(member.getIntro())
                    .xp(member.getXp())
                    .coin(member.getCoin())
                    .usedCoin(member.getUsedCoin())
                    .yoloScore(member.getYoloScore())
                    .score(member.getScore())
                    .firstWinCnt(member.getFirstWinCnt())
                    .secondWinCnt(member.getSecondWinCnt())
                    .thirdWinCnt(member.getThirdWinCnt())
                    .playCnt(member.getPlayCnt())
                    .char2dpath(char2dpath)
                    .char3dpath(char3dpath)
                    .badgename(badgename)
                    .titlepath(titlepath)
                    .build());

        } catch (Exception e) {
            log.error("회원 단일 조회 중 예외 발생", e);
            return responseHandler.fail("회원 단일 조회 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "유저 닉네임 검색", description = "닉네임으로 유저를 검색합니다.")
    @GetMapping("/search")
    public ResponseEntity<?> searchMemberByNickname(@RequestParam String keyword) {
        try {
            List<MemberResponseDto.MemberInfoWithUid> result = memberService.searchMemberByNickname(keyword);
            return responseHandler.success(result);
        } catch (Exception e) {
            log.error("닉네임 검색 실패", e);
            return responseHandler.fail("닉네임 검색 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "전체점수", description = "전체 점수를 제공합니다")
    @GetMapping("/rankings/total")
    public ResponseEntity<?> getTotalRanking(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal Member loginMember) {

        MemberResponseDto.GameRankingPage rankings = memberService.getTotalRankings(loginMember.getMemberUid(), page, size);
        return responseHandler.success(rankings);
    }

    @Operation(summary = "회원 정보 수정", description = "회원 정보 수정을 진행합니다.")
    @PutMapping("/{member-id}")
    public ResponseEntity<?> updateMember(@PathVariable("member-id") Long memberId,
                                          @RequestBody MemberRequestDto.UpdateMemberRequestDto newMember) {
        try {
            //memberService.encodeExistingPasswords();
            Member updatedMember = memberService.updateByMemberUid(memberId, newMember);
            return responseHandler.success(updatedMember);
        } catch (Exception e) {
            log.error("회원 정보 수정 중 예외 발생", e);
            return responseHandler.fail("회원 정보 수정 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "비밀번호 찾기", description = "비밀번호를 찾습니다.")
    @PostMapping("/password-reset")
    @ResponseBody
    public ResponseEntity<?> passwordReset(@RequestBody MemberRequestDto.FindPassword findPassword) {
        try {
            // 이메일과 이름으로 멤버가 있는지 확인
            Optional<Member> optionalMember = memberService.getMemberByEmailAndName(findPassword.getEmail(), findPassword.getName());

            if(optionalMember.isEmpty()) {
                // 해당 멤버가 존재하지 않음
                return responseHandler.fail("not found", HttpStatus.NOT_FOUND);
            }

            // 해당 멤버가 존재함 -> 비밀번호 초기화 이메일을 보냄
            Member member = optionalMember.get();

            // redis를 이용해 토큰 생성 -> 3분
            String prtk = tokenUtil.generate(20);
            passwordResetTokenService.writeTokenInfo(member.getPassword(), prtk);

            EmailResponseDto.EmailMessage emailMessage = new EmailResponseDto.EmailMessage().builder()
                    .to(member.getEmail())
                    .message(member.getName())
                    .subject("[Yolo Bring It] 비밀번호 재설정 요청")
                    .token(prtk)
                    .build();
            emailUtil.sendMail(emailMessage, "email/password_reset");

            return responseHandler.success();
        } catch (Exception e) {
            e.printStackTrace();
            return responseHandler.fail("server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "새 비밀번호 생성", description = "새로운 비밀번호를 생성합니다.")
    @PostMapping("/new-password")
    @ResponseBody
    public ResponseEntity<?> generateNewPassword(@RequestBody MemberRequestDto.NewPassword newPassword) {
        try {
            PasswordResetToken passwordResetToken = passwordResetTokenService.getPasswordResetToken(newPassword.getToken())
                    .orElseThrow(
                            () -> new RuntimeException("해당 토큰이 없습니다.")
                    );

            // 패스워드 리셋 가능한 상태
            Member member = memberService.getMemberByEmail(newPassword.getEmail()).orElseThrow(
                    () -> new RuntimeException("해당 유저가 없습니다.")
            );

            // 패스워드 변경
            memberService.resetPassword(member.getMemberUid(), passwordResetToken.getPasswordResetToken());

            return responseHandler.success();
        } catch (Exception e) {
            return responseHandler.fail("server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary="회원 탈퇴", description = "회원 탈퇴를 진행합니다.")
    @PatchMapping("/withdraw")
    public ResponseEntity<?> withdraw(@AuthenticationPrincipal Member loginMember) {
        try {
            memberService.withdraw(loginMember.getMemberUid());
            return responseHandler.success("회원 탈퇴가 완료되었습니다.");
        } catch(Exception e) {
            return responseHandler.fail("회원 탈퇴에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary="게임 점수 벌크 업데이트", description = "게임 점수를 벌크 업데이트합니다.")
    @PostMapping("/bulk-update-score")
    public ResponseEntity<?> bulkUpdateScore(@RequestBody List<Map<String, Object>> scoreList) {
        try {
            List<MemberResponseDto.ScoreInfo> list = memberService.bulkUpdateScore(scoreList);
            return responseHandler.success(list);
        } catch(Exception e) {
            Throwable real = (e instanceof InvocationTargetException)
                    ? ((InvocationTargetException)e).getTargetException()
                    : e;
            log.error("🔥 bulkUpdateScore 실제 에러", real);
            return responseHandler.fail("게임 점수 벌크 업데이트에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary="멤버ID에 해당하는 살아있는 멤버 조회", description = "멤버ID에 해당하는 멤버를 조회합니다.")
    @PostMapping("/active-member-info-map")
    public ResponseEntity<?> getActiveMemberInfoMap(@RequestBody List<Long> memberIds) {
        Map<Long, MemberResponseDto.MemberSimpleInfo> result = memberService.getActiveMemberInfoMap(memberIds);
        return responseHandler.success(result);
    }

    @GetMapping("/online-status")
    public Map<Long, Boolean> getOnlineStatuses(@RequestParam List<Long> memberIds) {
        return memberIds.stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        onlineMemberService::isOnline
                ));
    }

}
