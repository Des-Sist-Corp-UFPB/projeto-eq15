package com.materiais.instrucionais.demo.controller;

import com.materiais.instrucionais.demo.dto.RegisterUserRequest;
import com.materiais.instrucionais.demo.dto.UserResponse;
import com.materiais.instrucionais.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterUserRequest request) {
        return userService.registerCommonUser(request);
    }
}
