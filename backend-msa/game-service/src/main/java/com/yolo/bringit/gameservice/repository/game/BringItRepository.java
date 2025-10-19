package com.yolo.bringit.gameservice.repository.game;

import com.yolo.bringit.gameservice.domain.game.BringIt;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface BringItRepository extends CrudRepository<BringIt, String> {
    List<BringIt> findByRoomId(Long roomId);
}
