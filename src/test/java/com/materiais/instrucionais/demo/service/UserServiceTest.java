package com.materiais.instrucionais.demo.service;

import com.materiais.instrucionais.demo.domain.User;
import com.materiais.instrucionais.demo.domain.UserRole;
import com.materiais.instrucionais.demo.domain.UserStatus;
import com.materiais.instrucionais.demo.dto.RegisterUserRequest;
import com.materiais.instrucionais.demo.dto.UserResponse;
import com.materiais.instrucionais.demo.exception.EmailAlreadyRegisteredException;
import com.materiais.instrucionais.demo.exception.InstitutionalDomainNotAllowedException;
import com.materiais.instrucionais.demo.repository.UserRepository;
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
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private RegisterUserRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new RegisterUserRequest("John Doe", "john@gmail.com", "password@123");
    }

    @Test
    void registerCommonUser_withValidData_shouldReturnUserWithCommonRole() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("bcrypt_hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.registerCommonUser(validRequest);

        assertThat(response.role()).isEqualTo(UserRole.COMMON);
        assertThat(response.email()).isEqualTo("john@gmail.com");
        assertThat(response.name()).isEqualTo("John Doe");
        assertThat(response.status()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    void registerCommonUser_shouldHashPasswordWithBCrypt() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password@123")).thenReturn("$2a$hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            assertThat(u.getPassword()).isEqualTo("$2a$hash");
            assertThat(u.getPassword()).isNotEqualTo("password@123");
            return u;
        });

        userService.registerCommonUser(validRequest);

        verify(passwordEncoder).encode("password@123");
    }

    @Test
    void registerCommonUser_withDuplicateEmail_shouldThrowEmailAlreadyRegisteredException() {
        when(userRepository.existsByEmail("john@gmail.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.registerCommonUser(validRequest))
                .isInstanceOf(EmailAlreadyRegisteredException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void registerCommonUser_withInstitutionalDomain_shouldThrowInstitutionalDomainNotAllowedException() {
        var institutionalRequest = new RegisterUserRequest("Mary", "mary@dcx.ufpb.br", "password@123");

        assertThatThrownBy(() -> userService.registerCommonUser(institutionalRequest))
                .isInstanceOf(InstitutionalDomainNotAllowedException.class);

        verify(userRepository, never()).existsByEmail(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerCommonUser_withUpperCaseInstitutionalDomain_shouldThrowInstitutionalDomainNotAllowedException() {
        var institutionalRequest = new RegisterUserRequest("Mary", "mary@DCX.UFPB.BR", "password@123");

        assertThatThrownBy(() -> userService.registerCommonUser(institutionalRequest))
                .isInstanceOf(InstitutionalDomainNotAllowedException.class);
    }

    @Test
    void registerCommonUser_responseShouldNotExposePassword() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.registerCommonUser(validRequest);

        assertThat(response).isNotNull();
        assertThat(response.getClass().getDeclaredFields())
                .noneMatch(f -> f.getName().toLowerCase().contains("password"));
    }
}
