package com.yolo.bringit.gameservice.repository.liveKit;

import com.yolo.bringit.gameservice.domain.liveKit.VideoParticipant;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LiveKitParticipantRepository extends CrudRepository<VideoParticipant, String> {
    List<VideoParticipant> findAll();
}
