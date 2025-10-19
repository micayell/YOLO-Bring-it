package com.yolo.bringit.userservice.repository.token;

import com.yolo.bringit.userservice.domain.token.StaleToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaleTokenRepository extends CrudRepository<StaleToken, String> {
}
