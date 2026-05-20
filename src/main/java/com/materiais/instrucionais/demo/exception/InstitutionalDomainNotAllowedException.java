package com.materiais.instrucionais.demo.exception;

public class InstitutionalDomainNotAllowedException extends RuntimeException {
    public InstitutionalDomainNotAllowedException() {
        super("Emails with @dcx.ufpb.br domain must use the institutional registration flow");
    }
}
