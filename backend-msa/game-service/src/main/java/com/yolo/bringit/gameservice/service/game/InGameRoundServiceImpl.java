package com.yolo.bringit.gameservice.service.game;

import com.yolo.bringit.gameservice.domain.game.Game;
import com.yolo.bringit.gameservice.domain.game.InGameRound;
import com.yolo.bringit.gameservice.domain.room.Room;
import com.yolo.bringit.gameservice.dto.game.GameResponseDto;
import com.yolo.bringit.gameservice.repository.game.GameRepository;
import com.yolo.bringit.gameservice.repository.game.InGameRoundRepository;
import com.yolo.bringit.gameservice.repository.room.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class InGameRoundServiceImpl implements InGameRoundService {
    private final InGameRoundRepository inGameRoundRepository;
    private final GameRepository gameRepository;
    private final RoomRepository roomRepository;
    private final GameService gameService;

    @Override
    public void createGameRounds(Long roomId) {
        Room room = roomRepository.findByRoomUid(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));

        List<Long> gamePool = new ArrayList<>();
//        for (Long i = 1L; i <= gameRepository.count(); i++) {
//            gamePool.add(i);
//            gamePool.add(i);
//        }
        gamePool.add(1L);
        gamePool.add(2L);
        gamePool.add(2L);
        gamePool.add(3L);
        gamePool.add(3L);
        gamePool.add(4L);
        gamePool.add(4L);

        Collections.shuffle(gamePool);
        List<Long> gameList = gamePool.subList(0, room.getRoundNum());

        List<InGameRound> inGameRounds = new ArrayList<>();
        for (int i = 0; i < gameList.size(); i++) {
            inGameRounds.add(new InGameRound(roomId, i + 1, gameList.get(i)));
        }
        inGameRoundRepository.saveAll(inGameRounds);
    }

    @Override
    public GameResponseDto.GameRoundInfo getGameByRound(Long roomId, Integer roundIdx) {
        String id = roomId+":"+roundIdx;
        Long gameCode = inGameRoundRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("게임 라운드가 존재하지 않습니다.")).getGameCode();
        Game game = gameRepository.findByGameCode(gameCode)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 게임입니다."));

        return GameResponseDto.GameRoundInfo.builder()
                .gameCode(game.getGameCode())
                .gameName(game.getName())
                .gameDescription(game.getDescription())
                .build();
    }
}
