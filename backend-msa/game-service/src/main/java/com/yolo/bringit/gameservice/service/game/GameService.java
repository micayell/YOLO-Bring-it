package com.yolo.bringit.gameservice.service.game;

import java.util.Map;

public interface GameService {

    /* 게임 시작 소켓 */
    void gameStartSocket(Long roomId, Integer roundIdx, Long gameCode, Map<String, String> keywords);
    /* 게임 종료 소켓 */
    void gameEndSocket(Long roomId, Integer roundIdx, Long gameCode);
    /* 게임 패스 소켓 */
    void gameRoundPassSocket(Long roomId, Integer roundIdx, Long gameCode, Long memberId, String result);

    /* 게임 시작 조건 */
    int markArrived(Long roomId, Integer roundIdx, Long memberId);
    void clearArrived(Long roomId, Integer roundIdx);
    int getPlayersNumber(Long roomId);
    boolean acquireStartLock(Long roomId, Integer roundIdx, int expireSec);

    /* 게임 시작 */
    void saveGameTime(Long roomId, Integer roundIdx, long now, long startAt, int durationMs);
    /* 게임 종료 */
    void finishRound(Long roomId, Integer roundIdx, Long gameCode);

    /* 제시어를 뽑아 영어, 한글 키워드를 반환 */
    Map<String, String> getKeyword(Long gameCode);
    Map<String, String> getRGB();
}
