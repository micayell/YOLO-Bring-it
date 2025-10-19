package com.yolo.bringit.gameservice.repository.game;

import com.yolo.bringit.gameservice.domain.game.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game,Long> {
    Optional<Game> findByGameCode(Long gameCode);
}
