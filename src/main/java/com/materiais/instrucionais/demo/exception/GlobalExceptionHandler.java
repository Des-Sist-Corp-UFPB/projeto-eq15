package com.materiais.instrucionais.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ProblemDetail handleEmailJaCadastrado(EmailJaCadastradoException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("E-mail já cadastrado");
        return problem;
    }

    @ExceptionHandler(DominioInstitucionalNaoPermitidoException.class)
    public ProblemDetail handleDominioInstitucional(DominioInstitucionalNaoPermitidoException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        problem.setTitle("Domínio institucional não permitido neste fluxo");
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidacao(MethodArgumentNotValidException ex) {
        Map<String, String> erros = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage, (a, b) -> a));

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Dados inválidos");
        problem.setDetail("Um ou mais campos não passaram na validação");
        problem.setProperty("erros", erros);
        return problem;
    }
}