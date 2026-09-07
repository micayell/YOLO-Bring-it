package com.yolo.bringit.gameservice.repository.game;

import com.yolo.bringit.gameservice.domain.game.FingerIt;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface FingerItRepository extends CrudRepository<FingerIt, String> {
    List<FingerIt> findByRoomId(Long roomId);
}
