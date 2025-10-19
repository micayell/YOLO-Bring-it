package com.yolo.bringit.gameservice.service.room;

import com.yolo.bringit.gameservice.client.UserServiceClient;
import com.yolo.bringit.gameservice.domain.room.Room;
import com.yolo.bringit.gameservice.domain.room.RoomMember;
import com.yolo.bringit.gameservice.dto.client.ClientResponseDto;
import com.yolo.bringit.gameservice.dto.room.RoomRequestDto;
import com.yolo.bringit.gameservice.dto.stomp.GameStartSignal;
import com.yolo.bringit.gameservice.dto.stomp.ReadyStatusResponse;
import com.yolo.bringit.gameservice.dto.stomp.StompDto;
import com.yolo.bringit.gameservice.repository.room.RoomMemberRepository;
import com.yolo.bringit.gameservice.repository.room.RoomRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {
    private final RoomMemberRepository roomMemberRepository;
    private final RoomRepository roomRepository;

    private final UserServiceClient userServiceClient;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final CircuitBreakerFactory circuitBreakerFactory;

    @Override
    public Room matchRandom(Long userId) {
        List<Room> joinableRooms = roomRepository.findByIsJoinableTrueAndRoomTypeContainingOrderByRegDtAsc("random");

        List<Long> roomUids = joinableRooms.stream()
                .map(Room::getRoomUid)
                .collect(Collectors.toList());

        List<RoomMember> roomMembers = roomMemberRepository.findByRoom_RoomUidIn(roomUids);

        Map<Room, List<RoomMember>> roomToMembers = roomMembers.stream()
                .collect(Collectors.groupingBy(RoomMember::getRoom));

        /* Using a feign client */
        CircuitBreaker circuitBreaker = circuitBreakerFactory.create("circuitbreaker");
        List<ClientResponseDto.BlockedMemberInfo> blockedMemberInfos = circuitBreaker.run(() -> userServiceClient.getBlockedUsers().getData(),
                throwable -> new ArrayList<>());

        Set<Long> blockedIds = blockedMemberInfos.stream().map(b -> b.getMemberUid()).collect(Collectors.toSet());

        for (Room room : joinableRooms) {
            List<RoomMember> members = roomToMembers.getOrDefault(room, List.of());

            // 내가 같은 방에 들어가 있는 경우 pass
            if (members.stream().filter(m -> m.getUserId() == userId).count() > 0) {
                continue;
            }

            // 6명 초과 , 차단한 사람이 있으면 패스
            if (members.size() >= 6 || members.stream().anyMatch(m -> blockedIds.contains(m.getUserId())))
                continue;

            // 입장 가능한 방 존재
            RoomMember newRoomMember = RoomMember.builder()
                    .room(room)
                    .userId(userId)
                    .isReady(false)
                    .build();
            roomMemberRepository.saveAndFlush(newRoomMember);

            // 저장 후 참가 브로드캐스트
            ClientResponseDto.MemberSimpleInfo me = circuitBreaker.run(
                    () -> userServiceClient.getActiveMemberInfoMap(List.of(userId)).getData().get(userId),
                    t -> null
            );
            broadcastJoined(room.getRoomUid(), userId, me != null ? me.getNickname() : null);
            // 전체 로스터도 전송 (신규 유저에게 반영)
            broadcastRoster(room.getRoomUid());

            return room;
        }

        // 입장 가능한 방이 없다면 새로 만들기
        Room newRoom = roomRepository.save(Room.builder()
                .isJoinable(true)
                .managerId(userId)
                .roundNum(5)
                .roomType("random")
                .build());

        RoomMember newRoomMember = RoomMember.builder()
                .room(newRoom)
                .userId(userId)
                .isReady(false)
                .build();
        roomMemberRepository.save(newRoomMember);

        ClientResponseDto.MemberSimpleInfo me = circuitBreaker.run(
                () -> userServiceClient.getActiveMemberInfoMap(List.of(userId)).getData().get(userId),
                t -> null
        );
        broadcastJoined(newRoom.getRoomUid(), userId, me != null ? me.getNickname() : null);
        broadcastRoster(newRoom.getRoomUid());
        return newRoom;
    }

    @Override
    public Room createCustom(RoomRequestDto.CreateRoom createRoom, Long userId) {

        Room newRoom = roomRepository.save(Room.builder()
                .isJoinable(true)
                .managerId(userId)
                .roundNum(createRoom.getRoundNum())
                .roomType("custom")
                .build());

        RoomMember newRoomMember = RoomMember.builder()
                .room(newRoom)
                .userId(userId)
                .isReady(false)
                .build();
        roomMemberRepository.save(newRoomMember);
        return newRoom;
    }

    @Override
    public void inviteParticipant(Long roomId, Long senderId, Long receiverId) {
        // 수신자가 있는지 확인
        CircuitBreaker circuitBreaker = circuitBreakerFactory.create("circuitbreaker");
        Map<Long, ClientResponseDto.MemberSimpleInfo> infoMap = circuitBreaker.run(() ->
                        userServiceClient.getActiveMemberInfoMap(Arrays.asList(senderId, receiverId)).getData(),
                throwable -> new HashMap<>());

        ClientResponseDto.MemberSimpleInfo sender = infoMap.get(senderId);
        ClientResponseDto.MemberSimpleInfo receiver = infoMap.get(receiverId);

        // todo 현재 참여자가 온라인에 있는지 확인 -> websocket을 이용한 로직 구현
        Map<Long, Boolean> onlineMap = circuitBreaker.run(
                () -> userServiceClient.getOnlineStatuses(List.of(receiverId)),
                ex -> Map.of()  // 장애 시 빈 맵
        );
        boolean isReceiverOnline = onlineMap.getOrDefault(receiverId, false);

        if (!isReceiverOnline) {
            throw new IllegalStateException("해당 사용자는 현재 오프라인 상태입니다.");
        }

        StompDto.ParticipantNotificationDto notification = StompDto.ParticipantNotificationDto.builder()
                .senderId(senderId)
                .roomId(roomId)
                .senderNickname(sender.getNickname())
                .message(receiver.getNickname() + "님이 방 초대 요청을 보냈습니다.")
                .build();

        simpMessagingTemplate.convertAndSend("/topic/participants/" + receiverId, notification);
    }

    @Override
    public void acceptParticipantRequest(Long roomId, Long senderId, Long receiverId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("방 정보를 찾을 수 없습니다."));

        List<RoomMember> roomMemberList = roomMemberRepository.findAllByRoom(room);

        if (room.getIsJoinable() && roomMemberList.size() < 6) { // 방 참여 가능하고 인원이 다 안찼는지(최대 6명) 체크
            roomMemberRepository.save(RoomMember.builder()
                    .room(room)
                    .userId(receiverId)
                    .isReady(false)
                    .build());
        }

        /* Using a feign client */
        CircuitBreaker circuitBreaker = circuitBreakerFactory.create("circuitbreaker");

        ClientResponseDto.MemberSimpleInfo me = circuitBreaker.run(
                () -> userServiceClient.getActiveMemberInfoMap(List.of(receiverId)).getData().get(receiverId),
                t -> null
        );
        broadcastJoined(room.getRoomUid(), receiverId, me != null ? me.getNickname() : null);
        broadcastRoster(room.getRoomUid());

    }

    @Override
    @Transactional
    public boolean closeRoom(Long roomId, Long userId) {
        Room room = roomRepository.findByRoomUid(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방을 찾을 수 없습니다."));

        List<RoomMember> roomMemberList = roomMemberRepository.findAllByRoom(room);
        /*if (room.getRoomType().equals("random")) {
            if (roomMemberList.size() != 6) throw new IllegalArgumentException("6명이 되기 전까지는 게임을 시작할 수 없습니다.");
        }*/
//        else {
//            if (roomMemberList.size() == 1) throw new IllegalArgumentException("2명 이상이 되어야 게임을 시작할 수 있습니다.");
//        }

        if (!roomMemberRepository.existsByRoom_RoomUidAndUserId(roomId, userId)) {
            throw new IllegalArgumentException("이 방에 참가 중인 사용자만 게임을 시작할 수 있습니다.");
        }

        if (!room.getIsJoinable()) {
            return false;
        }

        room.setJoinable(false);
        return true;
    }

    @Override
    @Transactional
    public void leaveRoom(Long roomId, Long userId) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));

        if (!room.getIsJoinable()) {
            throw new IllegalStateException("진행 중인 방에서는 나갈 수 없습니다.");
        }

        RoomMember roomMember = roomMemberRepository
                .findByRoom_RoomUidAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("방에 해당 유저가 존재하지 않습니다"));

        roomMemberRepository.delete(roomMember);

        boolean hasRemainingMembers = roomMemberRepository.existsByRoom_RoomUid(roomId);


        ClientResponseDto.MemberSimpleInfo me = circuitBreakerFactory.create("circuitbreaker").run(
                () -> userServiceClient.getActiveMemberInfoMap(List.of(userId)).getData().get(userId),
                t -> null
        );
        broadcastLeft(roomId, userId, me != null ? me.getNickname() : null);

        if (!hasRemainingMembers) {
            roomRepository.deleteById(roomId);
        }
        else {
            broadcastRoster(roomId);
        }
    }

    @Override
    @Transactional
    public boolean toggleReadyRoom(Long roomId, Long userId) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));

        if (!room.getIsJoinable()) {
            throw new IllegalStateException("진행 중인 방에서는 레디상태를 변경할 수 없습니다.");
        }

        RoomMember roomMember = roomMemberRepository
                .findByRoom_RoomUidAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("방에 해당 유저가 존재하지 않습니다"));

        roomMember.changeIsReady(!roomMember.getIsReady());
        roomMemberRepository.save(roomMember);

        List<RoomMember> members = roomMemberRepository.findByRoom_RoomUid(roomId);
        long readyCount = members.stream().filter(RoomMember::getIsReady).count();
        long totalCount = members.size();

        simpMessagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/ready",
                new ReadyStatusResponse(userId, roomMember.getIsReady())
        );

        if (readyCount == totalCount) {
            simpMessagingTemplate.convertAndSend(
                    "/topic/room/" + roomId + "/can-start",
                    new GameStartSignal(true)
            );
        }

        return roomMember.getIsReady();

    }

    private void broadcastRoster(Long roomId) {
        List<RoomMember> members = roomMemberRepository.findByRoom_RoomUid(roomId);
        List<Long> memberIds = members.stream().map(RoomMember::getUserId).toList();

        CircuitBreaker cb = circuitBreakerFactory.create("circuitbreaker");
        Map<Long, ClientResponseDto.MemberSimpleInfo> infoMap = cb.run(
                () -> userServiceClient.getActiveMemberInfoMap(memberIds).getData(),
                ex -> new HashMap<>()
        );
        List<ClientResponseDto.MemberSimpleInfo> roster = memberIds.stream()
                .map(infoMap::get)
                .filter(Objects::nonNull)
                .toList();

        simpMessagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/roster",
                RoomRequestDto.RoomRosterDto.builder().roomId(roomId).members(roster).build()
        );
    }

    private void broadcastJoined(Long roomId, Long userId, String nickname) {
        simpMessagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/participants",
                RoomRequestDto.ParticipantEvent.builder()
                        .type("JOINED")
                        .roomId(roomId)
                        .memberId(userId)
                        .nickname(nickname)
                        .build()
        );
    }

    private void broadcastLeft(Long roomId, Long userId, String nickname) {
        simpMessagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/participants",
                RoomRequestDto.ParticipantEvent.builder()
                        .type("LEFT")
                        .roomId(roomId)
                        .memberId(userId)
                        .nickname(nickname)
                        .build()
        );
    }

}