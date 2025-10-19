package com.yolo.bringit.userservice.repository.item;

import com.yolo.bringit.userservice.domain.item.ItemFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemFileRepository extends JpaRepository<ItemFile, Long> {
}
