package com.yolo.bringit.gameservice.service.producer;

import com.yolo.bringit.gameservice.constants.Topics;
import com.yolo.bringit.saga.AchievementEarnedEvent;
import com.yolo.bringit.saga.YoloScoreChangedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public EventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishYoloScoreChange(YoloScoreChangedEvent event) {
        kafkaTemplate.send(Topics.YOLO_SCORE_CHANGED, event);
    }

    public void publishAchievementEarned(AchievementEarnedEvent event) {
        kafkaTemplate.send(Topics.ACHIEVEMENT_EARNED, event);
    }
}
