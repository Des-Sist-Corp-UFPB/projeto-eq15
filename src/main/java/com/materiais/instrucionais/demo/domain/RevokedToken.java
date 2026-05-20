package com.materiais.instrucionais.demo.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "revoked_tokens")
public class RevokedToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_id", nullable = false, unique = true, length = 36)
    private String tokenId;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at", nullable = false)
    private LocalDateTime revokedAt;

    protected RevokedToken() {}

    public RevokedToken(String tokenId, LocalDateTime expiresAt) {
        this.tokenId = tokenId;
        this.expiresAt = expiresAt;
        this.revokedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getTokenId() { return tokenId; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public LocalDateTime getRevokedAt() { return revokedAt; }
}
