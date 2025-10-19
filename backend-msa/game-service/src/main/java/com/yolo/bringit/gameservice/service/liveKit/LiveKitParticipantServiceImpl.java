package com.yolo.bringit.gameservice.service.liveKit;

import com.yolo.bringit.gameservice.domain.liveKit.VideoParticipant;
import com.yolo.bringit.gameservice.domain.room.RoomMember;
import com.yolo.bringit.gameservice.repository.liveKit.LiveKitParticipantRepository;
import com.yolo.bringit.gameservice.repository.room.RoomMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiveKitParticipantServiceImpl implements LiveKitParticipantService {

    private final LiveKitParticipantRepository liveKitParticipantRepository;
    private final RoomMemberRepository roomMemberRepository;

    /* 참가자 입장 이벤트 */
    public void handleJoin(String roomId, String identity) {
        boolean exists = roomMemberRepository.existsByRoom_RoomUidAndUserId(
                Long.parseLong(roomId), Long.parseLong(identity));

        if (!exists) {
            log.warn("{}(id)님은 이미 퇴장한 사용자입니다.", identity);
            throw new IllegalStateException("퇴장한 사용자는 다시 입장할 수 없습니다.");
        }

        VideoParticipant participant = VideoParticipant.builder()
                .roomId(roomId)
                .identity(identity)
                .isJoined(true)
                .joinedAt(LocalDateTime.now())
                .build();

        liveKitParticipantRepository.save(participant);
        log.info("✅ 입장 이벤트 처리 완료: {}", participant.getId());
    }

    /* 참가자 퇴장 이벤트 */
    public void handleLeave(String roomId, String identity) {
        String id = generateId(roomId, identity);

        liveKitParticipantRepository.findById(id).ifPresent(p -> {
            VideoParticipant updated = VideoParticipant.builder()
                    .roomId(p.getRoomId())
                    .identity(p.getIdentity())
                    .isJoined(false)
                    .joinedAt(p.getJoinedAt())
                    .leftAt(LocalDateTime.now())
                    .build();
            liveKitParticipantRepository.save(updated);
            log.info("✅ 퇴장 이벤트 처리 완료: {}", updated.getId());
        });
        RoomMember roomMember = roomMemberRepository
                .findByRoom_RoomUidAndUserId(Long.parseLong(roomId), Long.parseLong(identity))
                .orElseThrow(()->new IllegalArgumentException("방에 해당 유저가 존재하지 않습니다."));
        roomMemberRepository.delete(roomMember);
        log.info("{}(id)님이 게임 도중 방에서 퇴장했습니다.", identity);
    }

    private static String generateId(String roomId, String identity) {
        return "room:" + roomId + ":identity:" + identity;
    }

//    public List<VideoParticipant> getByRoomId(String roomId) {
//        return getAll().stream()
//                .filter(p -> p.getRoomId().equals(roomId))
//                .toList();
//    }
//
//    public List<VideoParticipant> getJoinedByRoomId(String roomId) {
//        return getAll().stream()
//                .filter(p -> p.getRoomId().equals(roomId) && Boolean.TRUE.equals(p.getIsJoined()))
//                .toList();
//    }
}
