CREATE TABLE usuario (
    id            BIGSERIAL PRIMARY KEY,
    nome          VARCHAR(120)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    senha         VARCHAR(255)  NOT NULL,
    perfil        VARCHAR(30)   NOT NULL,
    status        VARCHAR(20)   NOT NULL DEFAULT 'ATIVO',
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuario_email ON usuario (email);

COMMENT ON TABLE  usuario              IS 'Usuários da plataforma';
COMMENT ON COLUMN usuario.senha        IS 'Hash BCrypt — nunca texto plano';
COMMENT ON COLUMN usuario.perfil       IS 'COMUM | INSTITUCIONALIZADO | PROFESSOR | ADMIN';
COMMENT ON COLUMN usuario.status       IS 'ATIVO | SUSPENSO';
