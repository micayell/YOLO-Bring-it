package com.yolo.bringit.gameservice.service.game;

import com.yolo.bringit.gameservice.client.UserServiceClient;
import com.yolo.bringit.gameservice.domain.room.Room;
import com.yolo.bringit.gameservice.domain.room.RoomMember;
import com.yolo.bringit.gameservice.dto.client.ClientResponseDto;
import com.yolo.bringit.gameservice.repository.room.RoomMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameUserServiceImpl implements GameUserService {
    private final RoomMemberRepository roomMemberRepository;
    private final UserServiceClient userServiceClient;
    private final CircuitBreakerFactory circuitBreakerFactory;

    @Override
    public List<ClientResponseDto.MemberSimpleInfo> getLastGameUsers(Long userId) {
        // memberId가 참여했던 방들 중, room.isJoinable == false을 roomUid 기준 내림차순 정렬
        List<RoomMember> roomMembers = roomMemberRepository.findByUserIdOrderByRoom_RoomUidDesc(userId);

        for (RoomMember myEntry : roomMembers) {
            Room room = myEntry.getRoom();

            if (!room.getIsJoinable()) {
                // 본인 제외한 userId만 추출
                List<Long> memberIds = roomMemberRepository.findAllByRoom(room).stream()
                        .map(RoomMember::getUserId)
                        .filter(id -> !id.equals(userId))
                        .toList();

                // 2. user-service에 요청
                CircuitBreaker circuitBreker = circuitBreakerFactory.create("circuitbreaker");
                Map<Long, ClientResponseDto.MemberSimpleInfo> infoMap =
                        circuitBreker.run(() ->
                                        userServiceClient.getActiveMemberInfoMap(new ArrayList<>(memberIds)).getData(),
                                        throwable -> new HashMap<>());

                return memberIds.stream()
                        .map(infoMap::get)
                        .filter(Objects::nonNull)
                        .toList();
            }
        }

        // 게임한 방이 없거나 모두 진행 중이라면 빈 리스트 반환
        return List.of();
    }
}
