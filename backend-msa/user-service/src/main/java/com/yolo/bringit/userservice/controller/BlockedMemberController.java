package com.yolo.bringit.userservice.controller;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.ResponseDto;
import com.yolo.bringit.userservice.dto.member.MemberResponseDto;
import com.yolo.bringit.userservice.repository.member.BlockedMemberRepository;
import com.yolo.bringit.userservice.service.member.BlockedMemberService;
import com.yolo.bringit.userservice.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/blocked-members")
public class BlockedMemberController {
    private final BlockedMemberRepository blockedMemberRepositoryRepository;
    private final BlockedMemberService blockMemberService;
    private final ResponseHandler responseHandler;

    @PutMapping("/{member-id}/toggle")
    public ResponseEntity<?> toggleBlockMember(@PathVariable("member-id") Long memberId,
                                               @AuthenticationPrincipal Member currentUser) {
        try {
            boolean flag = blockMemberService.toggleblockMember(currentUser.getMemberUid(), memberId);
            if(flag) {
                return responseHandler.success("차단 되었습니다.");
            }
            else {
                return responseHandler.success("차단을 해제하였습니다");
            }

        } catch (Exception e) {
            log.error("차단 토글 중 예외 발생", e);
            return responseHandler.fail("차단 상태 변경 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> blockedUsers(@AuthenticationPrincipal Member currentUser) {
        try {
            List<MemberResponseDto.BlockedMemberInfo> blockedList =
                    blockMemberService.blockedMembers(currentUser.getMemberUid());

            return responseHandler.success(blockedList);
        } catch (Exception e) {
            log.error("차단 목록 조회 중 예외 발생", e);
            return responseHandler.fail("차단 목록 조회 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    @PutMapping("/{member-id}/toggle")
//    ResponseEntity<Void> toggleblockMember(@PathVariable("member-id") Long memberId) {
//        // 테스트용 가짜 로그인 사용자 (현재 로그인한 사용자 UID 1번이라 가정)
//        Long mockCurrentUserUid = 2L;
//        blockMemberService.toggleblockMember(mockCurrentUserUid, memberId);
//        return ResponseEntity.ok().build();
//    }
//
//    @GetMapping("/list")
//    List<MemberResponseDto.BlockedMemberInfo> blockedUsers() {
//        Long mockCurrentUserUid = 2L;
//        return blockMemberService.blockedMembers(mockCurrentUserUid);
//    }
}
