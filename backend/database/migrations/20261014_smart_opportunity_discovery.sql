ALTER TABLE research_opportunities
    ADD COLUMN IF NOT EXISTS paid BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'on-campus',
    ADD COLUMN IF NOT EXISTS skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE research_opportunities
SET
    skills = to_jsonb(
        ARRAY(
            SELECT btrim(skill)
            FROM unnest(
                regexp_split_to_array(COALESCE(required_skills, ''), ',')
            ) AS parts(skill)
            WHERE btrim(skill) <> ''
        )
    ),
    keywords = to_jsonb(
        ARRAY(
            SELECT keyword
            FROM unnest(
                ARRAY[COALESCE(research_area, '')] ||
                regexp_split_to_array(COALESCE(required_skills, ''), ',')
            ) AS parts(keyword)
            WHERE btrim(keyword) <> ''
        )
    );
