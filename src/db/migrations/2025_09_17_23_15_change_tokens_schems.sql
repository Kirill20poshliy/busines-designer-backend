DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'tokens'
            AND column_name = 'device_info'
    ) THEN
        ALTER TABLE tokens
        ADD COLUMN device_info VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'tokens'
            AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE tokens
        ADD COLUMN ip_address VARCHAR(45);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'tokens'
            AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE tokens
        ADD COLUMN expires_at TIMESTAMP NOT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'tokens'
            AND column_name = 'revoked'
    ) THEN
        ALTER TABLE tokens
        ADD COLUMN revoked BOOLEAN DEFAULT false;
    END IF;

END;
$$;