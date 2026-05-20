package com.materiais.instrucionais.demo.exception;

public class DominioInstitucionalNaoPermitidoException extends RuntimeException {
    public DominioInstitucionalNaoPermitidoException() {
        super("E-mails com domínio @dcx.ufpb.br devem usar o cadastro institucional");
    }
}