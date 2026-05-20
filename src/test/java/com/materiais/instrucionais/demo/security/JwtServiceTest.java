package com.materiais.instrucionais.demo.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    // 43 A's + '=' = 44-char Base64 string = 32 zero bytes = valid 256-bit HS256 key
    private static final String TEST_SECRET = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(TEST_SECRET, 60);
    }

    @Test
    void generateToken_shouldReturnNonBlankString() {
        String token = jwtService.generateToken("user@example.com");
        assertThat(token).isNotBlank();
    }

    @Test
    void generateToken_shouldContainEmailAsSubject() {
        String token = jwtService.generateToken("user@example.com");
        assertThat(jwtService.getSubject(token)).isEqualTo("user@example.com");
    }

    @Test
    void isTokenValid_withValidToken_shouldReturnTrue() {
        String token = jwtService.generateToken("user@example.com");
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_withTamperedToken_shouldReturnFalse() {
        String token = jwtService.generateToken("user@example.com");
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertThat(jwtService.isTokenValid(tampered)).isFalse();
    }

    @Test
    void isTokenValid_withExpiredToken_shouldReturnFalse() {
        JwtService expiredService = new JwtService(TEST_SECRET, -1);
        String token = expiredService.generateToken("user@example.com");
        assertThat(jwtService.isTokenValid(token)).isFalse();
    }

    @Test
    void getTokenId_shouldReturnUniqueIdPerToken() {
        String token1 = jwtService.generateToken("user@example.com");
        String token2 = jwtService.generateToken("user@example.com");
        assertThat(jwtService.getTokenId(token1)).isNotEqualTo(jwtService.getTokenId(token2));
    }

    @Test
    void getTokenId_shouldReturnNonBlankId() {
        String token = jwtService.generateToken("user@example.com");
        assertThat(jwtService.getTokenId(token)).isNotBlank();
    }
}
