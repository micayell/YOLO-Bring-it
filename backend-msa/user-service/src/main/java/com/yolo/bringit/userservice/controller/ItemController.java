package com.yolo.bringit.userservice.controller;

import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.item.ItemResponseDto;
import com.yolo.bringit.userservice.service.item.ItemService;
import com.yolo.bringit.userservice.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/items")
public class ItemController {
    private final ItemService itemService;
    private final ResponseHandler responseHandler;

    @GetMapping
    public ResponseEntity<?> getItems(@RequestParam String kind, @AuthenticationPrincipal Member member) {
        try {
            List<ItemResponseDto.ItemInfo> items = itemService.getItems(kind, member);

            if (items.isEmpty()) {
                return responseHandler.fail("아이템이 존재하지 않습니다.", HttpStatus.NOT_FOUND);
            }

            return responseHandler.success(items);
        } catch (Exception e) {
            log.error("아이템 조회 중 예외 발생", e);
            return responseHandler.fail("아이템 조회 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
