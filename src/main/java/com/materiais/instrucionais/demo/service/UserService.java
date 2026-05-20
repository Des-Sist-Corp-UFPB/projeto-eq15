package com.materiais.instrucionais.demo.service;

import com.materiais.instrucionais.demo.domain.User;
import com.materiais.instrucionais.demo.domain.UserRole;
import com.materiais.instrucionais.demo.dto.RegisterUserRequest;
import com.materiais.instrucionais.demo.dto.UserResponse;
import com.materiais.instrucionais.demo.exception.EmailAlreadyRegisteredException;
import com.materiais.instrucionais.demo.exception.InstitutionalDomainNotAllowedException;
import com.materiais.instrucionais.demo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final String INSTITUTIONAL_DOMAIN = "@dcx.ufpb.br";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse registerCommonUser(RegisterUserRequest request) {
        if (request.email().toLowerCase().endsWith(INSTITUTIONAL_DOMAIN)) {
            throw new InstitutionalDomainNotAllowedException();
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyRegisteredException();
        }

        var user = new User(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                UserRole.COMMON
        );

        return toResponse(userRepository.save(user));
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getStatus(), u.getCreatedAt());
    }
}
