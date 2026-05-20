package com.materiais.instrucionais.demo.service;

import com.materiais.instrucionais.demo.domain.PerfilUsuario;
import com.materiais.instrucionais.demo.domain.StatusUsuario;
import com.materiais.instrucionais.demo.domain.Usuario;
import com.materiais.instrucionais.demo.dto.CadastroUsuarioRequest;
import com.materiais.instrucionais.demo.dto.UsuarioResponse;
import com.materiais.instrucionais.demo.exception.DominioInstitucionalNaoPermitidoException;
import com.materiais.instrucionais.demo.exception.EmailJaCadastradoException;
import com.materiais.instrucionais.demo.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private CadastroUsuarioRequest requestValida;

    @BeforeEach
    void setUp() {
        requestValida = new CadastroUsuarioRequest("João Silva", "joao@gmail.com", "senha@123");
    }

    @Test
    void cadastrarComum_comDadosValidos_deveRetornarUsuarioComPerfilComum() {
        when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hash_bcrypt");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioResponse response = usuarioService.cadastrarComum(requestValida);

        assertThat(response.perfil()).isEqualTo(PerfilUsuario.COMUM);
        assertThat(response.email()).isEqualTo("joao@gmail.com");
        assertThat(response.nome()).isEqualTo("João Silva");
        assertThat(response.status()).isEqualTo(StatusUsuario.ATIVO);
    }

    @Test
    void cadastrarComum_deveCodificarSenhaComBCrypt() {
        when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("senha@123")).thenReturn("$2a$hash");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> {
            Usuario u = inv.getArgument(0);
            assertThat(u.getSenha()).isEqualTo("$2a$hash");
            assertThat(u.getSenha()).isNotEqualTo("senha@123");
            return u;
        });

        usuarioService.cadastrarComum(requestValida);

        verify(passwordEncoder).encode("senha@123");
    }

    @Test
    void cadastrarComum_comEmailDuplicado_deveLancarEmailJaCadastradoException() {
        when(usuarioRepository.existsByEmail("joao@gmail.com")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.cadastrarComum(requestValida))
                .isInstanceOf(EmailJaCadastradoException.class);

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void cadastrarComum_comDominioInstitucional_deveLancarExcecao() {
        var requestInstitucional = new CadastroUsuarioRequest("Maria", "maria@dcx.ufpb.br", "senha@123");

        assertThatThrownBy(() -> usuarioService.cadastrarComum(requestInstitucional))
                .isInstanceOf(DominioInstitucionalNaoPermitidoException.class);

        verify(usuarioRepository, never()).existsByEmail(any());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void cadastrarComum_comDominioInstitucionalEmMaiusculo_deveLancarExcecao() {
        var requestInstitucional = new CadastroUsuarioRequest("Maria", "maria@DCX.UFPB.BR", "senha@123");

        assertThatThrownBy(() -> usuarioService.cadastrarComum(requestInstitucional))
                .isInstanceOf(DominioInstitucionalNaoPermitidoException.class);
    }

    @Test
    void cadastrarComum_responseNaoDeveExporSenha() {
        when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$hash");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioResponse response = usuarioService.cadastrarComum(requestValida);

        // UsuarioResponse não deve ter campo de senha — verificado pela ausência do campo no record
        assertThat(response).isNotNull();
        assertThat(response.getClass().getDeclaredFields())
                .noneMatch(f -> f.getName().toLowerCase().contains("senha"));
    }
}
