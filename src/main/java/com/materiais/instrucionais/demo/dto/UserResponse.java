package com.materiais.instrucionais.demo.dto;

import com.materiais.instrucionais.demo.domain.UserRole;
import com.materiais.instrucionais.demo.domain.UserStatus;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        UserStatus status,
        LocalDateTime createdAt
) {}
