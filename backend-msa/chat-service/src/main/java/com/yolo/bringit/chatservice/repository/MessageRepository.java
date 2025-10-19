package com.yolo.bringit.chatservice.repository;

import com.yolo.bringit.chatservice.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long>, MessageRepositoryCustom {
}
