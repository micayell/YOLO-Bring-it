package com.yolo.bringit.gameservice.repository.game;

import com.yolo.bringit.gameservice.domain.game.TimeIt;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TimeItRepository extends CrudRepository<TimeIt, String> {
    List<TimeIt> findByRoomId(Long roomId);
}
