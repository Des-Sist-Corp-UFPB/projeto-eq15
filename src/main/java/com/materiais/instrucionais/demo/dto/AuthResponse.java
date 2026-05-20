package com.materiais.instrucionais.demo.dto;

import java.time.LocalDateTime;

public record AuthResponse(String token, LocalDateTime expiresAt) {}
