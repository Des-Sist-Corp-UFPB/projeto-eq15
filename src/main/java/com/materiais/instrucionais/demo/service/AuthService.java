package com.materiais.instrucionais.demo.service;

import com.materiais.instrucionais.demo.domain.RevokedToken;
import com.materiais.instrucionais.demo.domain.UserStatus;
import com.materiais.instrucionais.demo.dto.AuthResponse;
import com.materiais.instrucionais.demo.dto.LoginRequest;
import com.materiais.instrucionais.demo.exception.AccountSuspendedException;
import com.materiais.instrucionais.demo.exception.InvalidCredentialsException;
import com.materiais.instrucionais.demo.repository.RevokedTokenRepository;
import com.materiais.instrucionais.demo.repository.UserRepository;
import com.materiais.instrucionais.demo.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RevokedTokenRepository revokedTokenRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RevokedTokenRepository revokedTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new AccountSuspendedException();
        }

        String token = jwtService.generateToken(user.getEmail());
        LocalDateTime expiresAt = jwtService.getExpiration(token)
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        return new AuthResponse(token, expiresAt);
    }

    @Transactional
    public void logout(String token) {
        String tokenId = jwtService.getTokenId(token);
        LocalDateTime expiresAt = jwtService.getExpiration(token)
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        revokedTokenRepository.save(new RevokedToken(tokenId, expiresAt));
    }
}
