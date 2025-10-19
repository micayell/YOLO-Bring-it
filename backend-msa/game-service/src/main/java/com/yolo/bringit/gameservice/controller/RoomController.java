package com.yolo.bringit.gameservice.controller;

import com.yolo.bringit.gameservice.client.UserServiceClient;
import com.yolo.bringit.gameservice.domain.room.Room;
import com.yolo.bringit.gameservice.domain.room.RoomMember;
import com.yolo.bringit.gameservice.dto.client.ClientResponseDto;
import com.yolo.bringit.gameservice.dto.room.RoomRequestDto;
import com.yolo.bringit.gameservice.dto.room.RoomResponseDto;
import com.yolo.bringit.gameservice.repository.room.RoomMemberRepository;
import com.yolo.bringit.gameservice.repository.room.RoomRepository;
import com.yolo.bringit.gameservice.service.game.InGameRoundService;
import com.yolo.bringit.gameservice.service.room.RoomService;
import com.yolo.bringit.gameservice.util.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/rooms")
public class RoomController {
    private final RoomService roomService;
    private final ResponseHandler responseHandler;
    private final InGameRoundService inGameRoundService;

    private final UserServiceClient userServiceClient;
    private final CircuitBreakerFactory circuitBreakerFactory;
    private final RoomMemberRepository roomMemberRepository;
    private final RoomRepository roomRepository;

    @Operation(summary = "게임방을 생성/매칭 합니다", description = "게임방을 생성합니다.")
    @PostMapping
    public ResponseEntity<?> matchRoom(@RequestBody RoomRequestDto.CreateRoom createRoom,
                                       @RequestHeader("X-MEMBER-UID") Long userId) {
        try {
            Room room = null;

            if (createRoom.getRoomType().equals("random")) { // 랜덤한 방 생성
                room = roomService.matchRandom(userId);
            } else { // 커스텀 방 생성
                room = roomService.createCustom(createRoom, userId);
            }

            if (room != null) {
                Room currentRoom = room;
                CircuitBreaker circuitBreaker = circuitBreakerFactory.create("circuitbreaker");
                ClientResponseDto.MemberInfo memberInfo = circuitBreaker.run(() -> userServiceClient.getMember(currentRoom.getManagerId()).getData(),
                        throwable -> ClientResponseDto.MemberInfo.builder().build());

                return responseHandler.success(RoomResponseDto.RoomInfo.builder()
                        .roomUid(currentRoom.getRoomUid())
                        .roomType(currentRoom.getRoomType())
                        .roundNum(currentRoom.getRoundNum())
                        .isJoinable(currentRoom.getIsJoinable())
                        .managerNickname(memberInfo.getNickname())
                        .build());
            } else {
                log.error("게임방 생성 실패");
                return responseHandler.fail("게임방 생성 요청 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            log.error("게임방 생성 실패", e);
            return responseHandler.fail("게임방 생성 요청 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "게임 초대 요청", description = "게임 초대 요청을 보냅니다.")
    @PostMapping("/{room-id}/invitation")
    public ResponseEntity<?> inviteParticipant(@PathVariable("room-id") Long roomId,
                                               @RequestBody RoomRequestDto.InviteParticipant inviteParticipant,
                                               @RequestHeader("X-MEMBER-UID") Long senderId) {
        try {
            roomService.inviteParticipant(roomId, senderId, inviteParticipant.getReceiverId());

            return responseHandler.success("방 참여 요청을 보냈습니다.");
        } catch (Exception e) {
            log.error("방 참여 요청 실패", e);
            return responseHandler.fail("방 참여 요청 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "게임 초대 요청 수락", description = "게임 초대 요청을 수락합니다.")
    @PatchMapping("/{room-id}/invitation/{sender-id}/accepted")
    public ResponseEntity<?> acceptParticipantRequest(@PathVariable("room-id") Long roomId,
                                                      @PathVariable("sender-id") Long senderId,
                                                      @RequestHeader("X-MEMBER-UID") Long receiverId) {
        try {
            roomService.acceptParticipantRequest(roomId, senderId, receiverId);

            return responseHandler.success("방 참여 요청을 수락했습니다.");
        } catch (Exception e) {
            log.error("방 참여 수락 요청 실패", e);
            return responseHandler.fail("방 참여 수락 요청 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "게임 시작", description = "게임 시작 시 방의 상태를 Joinable=false로 변경하고 랜덤 게임 리스트를 생성합니다.")
    @PatchMapping("/{room-id}/status/starting")
    public ResponseEntity<?> closeRoom(@PathVariable("room-id") Long roomId, @RequestHeader("X-MEMBER-UID") Long userId) {
        try {
            boolean closefirst = roomService.closeRoom(roomId, userId);
            log.info("방 [{}] 닫기 성공", roomId);

            if (closefirst) {
                inGameRoundService.createGameRounds(roomId);
                log.info("방 [{}] 게임 리스트 생성 성공", roomId);
            }

            return responseHandler.success("게임 시작에 성공하였습니다.");
        } catch (Exception e) {
            log.error("방 닫기 실패", e);
            return responseHandler.fail("게임 시작 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "방 나가기", description = "사용자가 방에서 나갑니다")
    @DeleteMapping("/leave")
    public ResponseEntity<?> leaveRoom(@RequestBody RoomRequestDto.GetRoomInfo room, @RequestHeader("X-MEMBER-UID") Long userId) {
        try {
            roomService.leaveRoom(room.getRoomId(), userId);
            log.info("방 나가기", room.getRoomId());
            return responseHandler.success("방을 나갔습니다.");
        } catch (Exception e) {
            return responseHandler.fail("방 나가기 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "레디 토글", description = "레디/레디 취소 합니다")
    @PostMapping("/ready/toggle")
    public ResponseEntity<?> toggleReadyRoom(@RequestBody RoomRequestDto.GetRoomInfo room, @RequestHeader("X-MEMBER-UID") Long userId) {
        try {
            boolean ready = roomService.toggleReadyRoom(room.getRoomId(), userId);
            return responseHandler.success(ready); //true: 레디상태, false: 레디취소상태
        } catch (Exception e) {
            return responseHandler.fail("레디 상태 변경 실패", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{roomId}/roster")
    public ResponseEntity<RoomRequestDto.RoomRosterDto> getRoster(@PathVariable Long roomId) {
        List<RoomMember> members = roomMemberRepository.findByRoom_RoomUid(roomId);
        List<Long> ids = members.stream().map(RoomMember::getUserId).toList();

        CircuitBreaker cb = circuitBreakerFactory.create("circuitbreaker");
        Map<Long, ClientResponseDto.MemberSimpleInfo> infoMap = cb.run(
                () -> userServiceClient.getActiveMemberInfoMap(ids).getData(),
                ex -> new HashMap<>()
        );
        List<ClientResponseDto.MemberSimpleInfo> roster = ids.stream()
                .map(infoMap::get).filter(Objects::nonNull).toList();

        return ResponseEntity.ok(RoomRequestDto.RoomRosterDto.builder().roomId(roomId).members(roster).build());
    }

    @Operation(summary = "방 정보 조회", description = "roomUid를 기반으로 방 정보를 조회합니다.")
    @GetMapping("/{roomUid}")
    public ResponseEntity<?> getRoomInfo(@PathVariable Long roomUid) {
        try {
            Optional<Room> roomOpt = roomRepository.findByRoomUid(roomUid);
            if (roomOpt.isEmpty()) {
                return responseHandler.fail("존재하지 않는 방입니다.", HttpStatus.NOT_FOUND);
            }

            Room room = roomOpt.get();
            RoomResponseDto.RoomInfoWithoutManager dto = RoomResponseDto.RoomInfoWithoutManager.builder()
                    .roomUid(room.getRoomUid())
                    .roomType(room.getRoomType())
                    .roundNum(room.getRoundNum())
                    .isJoinable(room.getIsJoinable())
                    .build();

            return responseHandler.success(dto);
        } catch (Exception e) {
            log.error("방 정보 조회 실패", e);
            return responseHandler.fail("방 정보 조회 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}