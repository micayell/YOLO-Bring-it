package com.yolo.bringit.gameservice.controller;

import com.yolo.bringit.gameservice.dto.client.ClientResponseDto;
import com.yolo.bringit.gameservice.service.game.GameUserService;
import com.yolo.bringit.gameservice.util.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class GameUserController {
    private final GameUserService gameUserService;
    private final ResponseHandler responseHandler;

    @Operation(summary="최근에 같이 게임한 유저 조회", description = "최근에 같이 게임한 유저를 조회합니다.")
    @GetMapping("/{user-id}/last-game-users")
    public ResponseEntity<?> getLastGameUsers(@PathVariable("user-id") Long userId) {
        try {
            List<ClientResponseDto.MemberSimpleInfo> lastGameUsers = gameUserService.getLastGameUsers(userId);
            return responseHandler.success(lastGameUsers);
        } catch(Exception e) {
            return responseHandler.fail("최근에 같이 게임한 유저를 불러오기 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
