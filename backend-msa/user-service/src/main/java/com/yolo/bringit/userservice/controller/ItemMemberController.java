package com.yolo.bringit.userservice.controller;

import com.yolo.bringit.userservice.domain.member.ItemMember;
import com.yolo.bringit.userservice.domain.member.Member;
import com.yolo.bringit.userservice.dto.ResponseDto;
import com.yolo.bringit.userservice.dto.itemMember.ItemMemberRequestDto;
import com.yolo.bringit.userservice.dto.itemMember.ItemMemberResponseDto;
import com.yolo.bringit.userservice.service.member.ItemMemberService;
import com.yolo.bringit.userservice.util.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/item-members")
public class ItemMemberController {
    private final ItemMemberService inventoryService;
    private final ResponseHandler responseHandler;

    @Operation(summary = "상점에서 아이템 구매", description = "상점에서 아이템 하나를 구매합니다.")
    @PostMapping
    public ResponseEntity<?> purchaseItem(@RequestBody ItemMemberRequestDto.PurchaseItem purchaseItem,
                                          @AuthenticationPrincipal Member member) {
        try {
            inventoryService.purchaseItem(purchaseItem, member);

            // 구매에 성공하면 200 status code 보냄
            return responseHandler.success();
        } catch (Exception e) {
            log.error("아이템 구매 실패", e);
            return responseHandler.fail("아이템 구매 요청 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "인벤토리 내 아이템 조회", description = "인벤토리에서 카테고리 별 전체 아이템을 조회합니다.")
    @GetMapping("/{category-code}")
    public ResponseEntity<?> getByCategory (@PathVariable("category-code") String categoryCode, @AuthenticationPrincipal Member loginMember) {
        try {


            List<ItemMemberResponseDto.ItemMemberInfo> list =
                    inventoryService.getItemsByCategory(categoryCode, loginMember)
                            .stream()
                            .map(inv -> ItemMemberResponseDto.ItemMemberInfo.builder()
                                    .itemMemberUid(inv.getItemMemberUid())
                                    .itemId(inv.getItem().getItemUid())
                                    .itemName(inv.getItem().getName())
                                    .categoryCode(categoryCode)
                                    .isEquipped(inv.getIsEquipped()) // 아이템 장착/해제 로직 merge 후 주석 해제
                                    .img1(inv.getItem().getItemFiles().stream()
                                            .map(f -> f.getYoloFile())
                                            .filter(Objects::nonNull)
                                            .filter(yf -> !yf.getExt().equals("glb"))
                                            .map(yf -> yf.getPath())
                                            .filter(Objects::nonNull)
                                            .findFirst()
                                            .orElse(null))
                                    .img2(inv.getItem().getItemFiles().stream()
                                            .map(f -> f.getYoloFile())
                                            .filter(Objects::nonNull)
                                            .filter(yf -> yf.getExt().equals("glb"))
                                            .map(yf -> yf.getPath())
                                            .filter(Objects::nonNull)
                                            .findFirst()
                                            .orElse(null))
                                    .build()
                            )
                            .toList();
            return responseHandler.success(list);
        } catch (Exception e) {
            log.error("아이템 조회 실패");
            return responseHandler.fail(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "인벤토리 내 아이템 장착", description = "인벤토리 내 아이템을 장착합니다.")
    @PatchMapping("/{item-member-uid}/equipment")
    public ResponseEntity<?> toggleItemEquip (@PathVariable("item-member-uid") Long itemMemberUid, @AuthenticationPrincipal Member member) {
        try {
            ItemMember updated = inventoryService.toggleItemEquip(itemMemberUid, member);
            ItemMemberResponseDto.ToggleItemEquipInfo toggleEquipInfo = ItemMemberResponseDto.ToggleItemEquipInfo.builder()
                    .itemMemberUid(updated.getItemMemberUid())
                    .itemId(updated.getItem().getItemUid())
                    .categoryCode(updated.getItem().getItemCategory().getCategoryCode())
                    .equipped(updated.getIsEquipped())
                    .build();
            return responseHandler.success(toggleEquipInfo);
        } catch(Exception e) {
            log.error("아이템 장착/해제 실패");
            return responseHandler.fail(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
