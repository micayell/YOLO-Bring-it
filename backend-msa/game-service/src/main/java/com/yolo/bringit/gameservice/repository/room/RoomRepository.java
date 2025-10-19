package com.yolo.bringit.gameservice.repository.room;

import com.yolo.bringit.gameservice.domain.room.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomUid(Long roomId);
    List<Room> findByIsJoinableTrueAndRoomTypeContainingOrderByRegDtAsc(String keyword);
    Optional<Room> findByRoomUidAndIsJoinableFalse(Long roomId);
}
