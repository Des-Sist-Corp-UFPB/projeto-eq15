CREATE TABLE users (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    user_role   VARCHAR(30)  NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

COMMENT ON TABLE  users            IS 'Platform users';
COMMENT ON COLUMN users.password   IS 'BCrypt hash — never plain text';
COMMENT ON COLUMN users.user_role  IS 'COMMON | INSTITUTIONAL | PROFESSOR | ADMIN';
COMMENT ON COLUMN users.status     IS 'ACTIVE | SUSPENDED';
