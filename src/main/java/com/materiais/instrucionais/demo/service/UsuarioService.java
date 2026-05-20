package com.materiais.instrucionais.demo.service;

import com.materiais.instrucionais.demo.domain.PerfilUsuario;
import com.materiais.instrucionais.demo.domain.Usuario;
import com.materiais.instrucionais.demo.dto.CadastroUsuarioRequest;
import com.materiais.instrucionais.demo.dto.UsuarioResponse;
import com.materiais.instrucionais.demo.exception.DominioInstitucionalNaoPermitidoException;
import com.materiais.instrucionais.demo.exception.EmailJaCadastradoException;
import com.materiais.instrucionais.demo.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private static final String DOMINIO_INSTITUCIONAL = "@dcx.ufpb.br";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponse cadastrarComum(CadastroUsuarioRequest request) {
        if (request.email().toLowerCase().endsWith(DOMINIO_INSTITUCIONAL)) {
            throw new DominioInstitucionalNaoPermitidoException();
        }
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new EmailJaCadastradoException();
        }

        var usuario = new Usuario(
                request.nome(),
                request.email(),
                passwordEncoder.encode(request.senha()),
                PerfilUsuario.COMUM
        );

        return toResponse(usuarioRepository.save(usuario));
    }

    private UsuarioResponse toResponse(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getPerfil(), u.getStatus(), u.getCriadoEm());
    }
}