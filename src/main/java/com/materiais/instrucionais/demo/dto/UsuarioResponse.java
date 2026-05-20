package com.materiais.instrucionais.demo.dto;

import com.materiais.instrucionais.demo.domain.PerfilUsuario;
import com.materiais.instrucionais.demo.domain.StatusUsuario;
import java.time.LocalDateTime;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        PerfilUsuario perfil,
        StatusUsuario status,
        LocalDateTime criadoEm
) {}