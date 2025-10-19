package com.yolo.bringit.chatservice.repository;

import com.yolo.bringit.chatservice.domain.Message;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface MessageRepositoryCustom {
    /* user <-> peer 간 메시지 중 regDt < cursor 만 최신순으로 pageable.size 만큼 조회 */
    List<Message> findMessagesBefore(Long userId, Long peerId, LocalDateTime cursor, Pageable pageable);
}