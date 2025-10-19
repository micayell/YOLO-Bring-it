package com.yolo.bringit.gameservice.repository.game;

import com.yolo.bringit.gameservice.domain.game.InGameScore;
import org.springframework.data.repository.CrudRepository;

public interface InGameScoreRepository extends CrudRepository<InGameScore, String> {
}
