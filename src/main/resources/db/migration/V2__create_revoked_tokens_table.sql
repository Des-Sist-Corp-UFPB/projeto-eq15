CREATE TABLE revoked_tokens (
    id          BIGSERIAL    PRIMARY KEY,
    token_id    VARCHAR(36)  NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    revoked_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revoked_tokens_token_id ON revoked_tokens (token_id);

COMMENT ON TABLE  revoked_tokens            IS 'JWT revocation list — stores invalidated token JTIs until expiration';
COMMENT ON COLUMN revoked_tokens.token_id   IS 'JWT jti claim (UUID) of the revoked token';
COMMENT ON COLUMN revoked_tokens.expires_at IS 'When the original token would expire — for cleanup jobs';
