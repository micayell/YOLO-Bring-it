package com.yolo.bringit.userservice.repository.password;

import com.yolo.bringit.userservice.domain.password.PasswordResetToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends CrudRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByPasswordResetToken(String token);
}
