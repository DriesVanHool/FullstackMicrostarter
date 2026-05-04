package com.driesvanhool.fullstackmicrostarter.userservice.repository;

import com.driesvanhool.fullstackmicrostarter.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    @Query("select user from User user where user.keycloakId = :identityId")
    Optional<User> findByIdentityId(String identityId);
}
