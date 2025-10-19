package com.yolo.bringit.gameservice.client;

import com.yolo.bringit.gameservice.dto.ResponseDto;
import com.yolo.bringit.gameservice.dto.client.ClientRequestDto;
import com.yolo.bringit.gameservice.dto.client.ClientResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name="user-service")
public interface UserServiceClient {

    // user
    @GetMapping("/users/{member-id}")
    ResponseDto<ClientResponseDto.MemberInfo> getMember(@PathVariable("member-id") Long memberId);

    @PostMapping("/users/bulk-update-score")
    ResponseDto<List<ClientResponseDto.ScoreInfo>> bulkUpdateScore(@RequestBody List<Map<String, Object>> finalScoreList);

    @PostMapping("/users/active-member-info-map")
    ResponseDto<Map<Long, ClientResponseDto.MemberSimpleInfo>> getActiveMemberInfoMap(@RequestBody List<Long> memberIds);

    // blocked member
    @GetMapping("/users/blocked-members/list")
    ResponseDto<List<ClientResponseDto.BlockedMemberInfo>> getBlockedUsers();

    @GetMapping("/users/online-status")
    Map<Long, Boolean> getOnlineStatuses(@RequestParam("memberIds") List<Long> memberIds);

}
