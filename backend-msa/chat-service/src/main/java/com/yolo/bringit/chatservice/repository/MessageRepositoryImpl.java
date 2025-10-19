package com.yolo.bringit.chatservice.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.yolo.bringit.chatservice.domain.Message;
import com.yolo.bringit.chatservice.domain.QMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
public class MessageRepositoryImpl implements MessageRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Message> findMessagesBefore(Long userId, Long peerId, LocalDateTime cursor, Pageable pageable) {
        QMessage m = QMessage.message;

        return queryFactory
                .selectFrom(m)
                .where(
                        m.senderId.in(userId, peerId).and(m.receiverId.in(userId, peerId)),
                        m.regDt.lt(cursor)
                )
                .orderBy(m.regDt.desc())
                .offset(pageable.getOffset()) // 0
                .limit(pageable.getPageSize())
                .fetch();
    }
}
