-- Migration file for the complete MPO Pilot database schema
-- Date: 2026-03-08 22:35:39 UTC

CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE initiatives (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE signals (
    id SERIAL PRIMARY KEY,
    initiative_id INT REFERENCES initiatives(id) ON DELETE CASCADE,
    signal_type VARCHAR(255) NOT NULL,
    value NUMERIC,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE diagnostics (
    id SERIAL PRIMARY KEY,
    initiative_id INT REFERENCES initiatives(id) ON DELETE CASCADE,
    diagnosis TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE advisory (
    id SERIAL PRIMARY KEY,
    initiative_id INT REFERENCES initiatives(id) ON DELETE CASCADE,
    advice TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE dependencies (
    id SERIAL PRIMARY KEY,
    initiative_id INT REFERENCES initiatives(id) ON DELETE CASCADE,
    dependency TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE maturity_scores (
    id SERIAL PRIMARY KEY,
    initiative_id INT REFERENCES initiatives(id) ON DELETE CASCADE,
    score INT CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE priority_scores (
    id SERIAL PRIMARY KEY,
    initiative_id INT REFERENCES initiatives(id) ON DELETE CASCADE,
    score INT CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE frameworks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    initiative_id INT REFERENCES initiatives(id) ON DELETE CASCADE,
    meeting_date TIMESTAMP NOT NULL,
    agenda TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE reporting_systems (
    id SERIAL PRIMARY KEY,
    initiative_id INT REFERENCES initiatives(id) ON DELETE CASCADE,
    report_type VARCHAR(255) NOT NULL,
    report_data JSON,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Additional indexes, constraints, and relationships can be added as needed.
