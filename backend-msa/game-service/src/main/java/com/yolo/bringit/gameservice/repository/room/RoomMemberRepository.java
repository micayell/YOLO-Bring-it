package com.yolo.bringit.gameservice.repository.room;

import com.yolo.bringit.gameservice.domain.room.Room;
import com.yolo.bringit.gameservice.domain.room.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    List<RoomMember> findByRoom_RoomUidIn(List<Long> roomUids);
    List<RoomMember> findAllByRoom(Room room);
    /* 특정 멤버가 특정 방에 속해있는지 여부 확인 */
    boolean existsByRoom_RoomUidAndUserId(Long roomUid, Long userId);
    Optional<RoomMember> findByRoom_RoomUidAndUserId(Long roomUid, Long memberUid);
    boolean existsByRoom_RoomUid(Long roomUid);
    List<RoomMember> findByRoom_RoomUid(Long roomId);
    List<RoomMember> findByUserIdOrderByRoom_RoomUidDesc(Long memberId);
    Integer countByRoom_RoomUid(Long roomUid);
}
