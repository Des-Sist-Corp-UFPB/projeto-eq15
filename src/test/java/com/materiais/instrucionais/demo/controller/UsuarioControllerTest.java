package com.materiais.instrucionais.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.materiais.instrucionais.demo.dto.CadastroUsuarioRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
class UsuarioControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void cadastrar_comDadosValidos_deveRetornar201ComUsuarioCriado() throws Exception {
        var request = new CadastroUsuarioRequest("João Silva", "joao@gmail.com", "senha@123");

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nome").value("João Silva"))
                .andExpect(jsonPath("$.email").value("joao@gmail.com"))
                .andExpect(jsonPath("$.perfil").value("COMUM"))
                .andExpect(jsonPath("$.status").value("ATIVO"))
                .andExpect(jsonPath("$.senha").doesNotExist());
    }

    @Test
    void cadastrar_comEmailDuplicado_deveRetornar409() throws Exception {
        var request = new CadastroUsuarioRequest("Maria Souza", "duplicado@gmail.com", "senha@123");

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void cadastrar_comDominioInstitucional_deveRetornar422() throws Exception {
        var request = new CadastroUsuarioRequest("Pedro", "pedro@dcx.ufpb.br", "senha@123");

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void cadastrar_comEmailInvalido_deveRetornar400() throws Exception {
        var request = new CadastroUsuarioRequest("Ana", "email-invalido", "senha@123");

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.email").exists());
    }

    @Test
    void cadastrar_semNome_deveRetornar400() throws Exception {
        var request = new CadastroUsuarioRequest("", "ana@gmail.com", "senha@123");

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.nome").exists());
    }

    @Test
    void cadastrar_comSenhaCurta_deveRetornar400() throws Exception {
        var request = new CadastroUsuarioRequest("Lucas", "lucas@gmail.com", "abc");

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.senha").exists());
    }
}
