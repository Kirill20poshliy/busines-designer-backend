DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM projects
        WHERE name = 'Тестовый проект'
    ) THEN
        DELETE FROM projects
        WHERE name = 'Тестовый проект';
    END IF;
END;
$$;