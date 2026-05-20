package com.materiais.instrucionais.demo.repository;

import com.materiais.instrucionais.demo.domain.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    boolean existsByTokenId(String tokenId);
}
