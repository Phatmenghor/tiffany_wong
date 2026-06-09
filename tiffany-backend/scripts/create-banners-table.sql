-- ============================================================================
-- CREATE BANNERS TABLE
-- Run this script on the production database to fix the missing table error:
-- Schema-validation: missing table [banners]
-- ============================================================================

CREATE TABLE IF NOT EXISTS banners (
    id              UUID            NOT NULL,
    version         BIGINT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL,
    updated_at      TIMESTAMP,
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    is_deleted      BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    deleted_by      VARCHAR(255),
    image_url       VARCHAR(255)    NOT NULL,
    description     TEXT,
    link_url        VARCHAR(255),
    status          VARCHAR(50)     NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT pk_banners PRIMARY KEY (id)
);

-- Indexes (matches create-all-indexes.sql)
CREATE INDEX IF NOT EXISTS idx_banners_status     ON banners(status);
CREATE INDEX IF NOT EXISTS idx_banners_is_deleted ON banners(is_deleted);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at DESC);
