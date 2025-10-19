package com.yolo.bringit.gameservice.repository.game;

import com.yolo.bringit.gameservice.domain.game.FaceIt;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface FaceItRepository extends CrudRepository<FaceIt, String> {
    List<FaceIt> findByRoomId(Long roomId);
}
