package com.materiais.instrucionais.demo.controller;

import com.materiais.instrucionais.demo.dto.CadastroUsuarioRequest;
import com.materiais.instrucionais.demo.dto.UsuarioResponse;
import com.materiais.instrucionais.demo.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse cadastrar(@Valid @RequestBody CadastroUsuarioRequest request) {
        return usuarioService.cadastrarComum(request);
    }
}