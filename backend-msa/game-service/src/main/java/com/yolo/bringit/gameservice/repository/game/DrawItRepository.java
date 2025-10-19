package com.yolo.bringit.gameservice.repository.game;

import com.yolo.bringit.gameservice.domain.game.DrawIt;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface DrawItRepository extends CrudRepository<DrawIt, String> {
    List<DrawIt> findByRoomId(Long roomId);
}
