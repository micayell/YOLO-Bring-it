package com.yolo.bringit.userservice.controller;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.ResponseDto;
import com.yolo.bringit.userservice.dto.friend.FriendResponseDto;
import com.yolo.bringit.userservice.service.member.FriendService;
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
@RequestMapping(value = "/friends")
public class FriendController {
    private final FriendService friendService;
    private final ResponseHandler responseHandler;

    @PostMapping("/{receiver-id}")
    public ResponseEntity<?> sendFriendRequest(@PathVariable("receiver-id") Long receiverId, @AuthenticationPrincipal Member loginMember) {
        try {
            FriendResponseDto.FriendInfo result = friendService.sendFriendRequest(loginMember, receiverId);
            return responseHandler.success(result, "친구 요청을 보냈습니다.", HttpStatus.OK);
        } catch (Exception e) {
            log.error("친구 요청 실패", e);
            return responseHandler.fail("친구 요청 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/{sender-id}/accepted")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable("sender-id") Long senderId, @AuthenticationPrincipal Member loginMember) {
        try {
            FriendResponseDto.FriendInfo result = friendService.acceptFriendRequest(senderId, loginMember);
            return responseHandler.success(result, "친구 요청을 수락했습니다.", HttpStatus.OK);
        } catch (Exception e) {
            log.error("친구 수락 실패", e);
            return responseHandler.fail("친구 수락 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{member-id}")
    public ResponseEntity<?> deleteFriend(@PathVariable("member-id") Long memberId, @AuthenticationPrincipal Member loginMember) {
        try {
            friendService.deleteFriend(loginMember, memberId);
            return responseHandler.success("친구 삭제 완료");
        } catch (Exception e) {
            log.error("친구 삭제 실패", e);
            return responseHandler.fail("친구 삭제 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getFriendList(@AuthenticationPrincipal Member loginMember) {
        try {
            List<FriendResponseDto.FriendInfoWithOnline> list = friendService.getFriendList(loginMember);
            return responseHandler.success(list, "친구 목록 조회 성공", HttpStatus.OK);
        } catch (Exception e) {
            log.error("친구 목록 조회 실패", e);
            return responseHandler.fail("친구 목록 조회 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/received")
    public ResponseEntity<?> getPendingRequests(@AuthenticationPrincipal Member loginMember) {
        try {
            List<FriendResponseDto.FriendInfo> list = friendService.getPendingRequests(loginMember);
            return responseHandler.success(list, "받은 친구 요청 조회 성공", HttpStatus.OK);
        } catch (Exception e) {
            log.error("받은 친구 요청 조회 실패", e);
            return responseHandler.fail("친구 요청 조회 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{nickname}")
    public ResponseEntity<?> searchFriends(@PathVariable("nickname") String nickname, @AuthenticationPrincipal Member loginMember) {
        try {
            List<FriendResponseDto.SearchFriendInfo> result = friendService.searchFriendsByNickname(loginMember, nickname);
            return responseHandler.success(result, "친구 검색 성공", HttpStatus.OK);
        } catch (Exception e) {
            log.error("친구 검색 실패", e);
            return responseHandler.fail("친구 검색 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
