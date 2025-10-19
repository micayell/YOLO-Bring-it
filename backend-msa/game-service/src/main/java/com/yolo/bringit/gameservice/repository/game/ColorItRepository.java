package com.yolo.bringit.gameservice.repository.game;

import com.yolo.bringit.gameservice.domain.game.ColorIt;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface ColorItRepository extends CrudRepository<ColorIt, String> {
    List<ColorIt> findByRoomId(Long roomId);
}
