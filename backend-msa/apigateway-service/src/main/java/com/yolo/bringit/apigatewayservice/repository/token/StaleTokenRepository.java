package com.yolo.bringit.apigatewayservice.repository.token;

import com.yolo.bringit.apigatewayservice.domain.token.StaleToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaleTokenRepository extends CrudRepository<StaleToken, String> {
    Optional<StaleToken> findByAccessToken(String accessToken);
}
