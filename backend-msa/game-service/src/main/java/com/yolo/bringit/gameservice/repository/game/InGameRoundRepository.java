package com.yolo.bringit.gameservice.repository.game;

import com.yolo.bringit.gameservice.domain.game.InGameRound;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InGameRoundRepository extends CrudRepository<InGameRound,String> {
    /* 특정 방의 전체 게임 리스트 조회 */
    List<InGameRound> findAllByRoomId(Long roomId);
}
