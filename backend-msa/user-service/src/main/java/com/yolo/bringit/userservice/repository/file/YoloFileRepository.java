package com.yolo.bringit.userservice.repository.file;

import com.yolo.bringit.userservice.domain.file.YoloFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface YoloFileRepository extends JpaRepository<YoloFile, Long> {
}
