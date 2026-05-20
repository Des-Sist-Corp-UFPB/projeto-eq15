package com.materiais.instrucionais.demo.exception;

public class EmailJaCadastradoException extends RuntimeException {
    public EmailJaCadastradoException() {
        super("E-mail já cadastrado");
    }
}