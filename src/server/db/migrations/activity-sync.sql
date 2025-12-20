-- Migration: Activity Sync Tables
-- Run this in your Neon database console if drizzle-kit push doesn't work interactively

-- GitHub Activities Table
CREATE TABLE IF NOT EXISTS github_activities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    repository TEXT NOT NULL,
    url TEXT NOT NULL,
    is_private BOOLEAN NOT NULL DEFAULT false,
    event_date TIMESTAMP NOT NULL,
    payload TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS github_activities_event_id_idx ON github_activities(event_id);
CREATE INDEX IF NOT EXISTS github_activities_date_idx ON github_activities(event_date);
CREATE INDEX IF NOT EXISTS github_activities_type_idx ON github_activities(type);
CREATE INDEX IF NOT EXISTS github_activities_repo_idx ON github_activities(repository);

-- Spotify Listens Table
CREATE TABLE IF NOT EXISTS spotify_listens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    track_id TEXT NOT NULL,
    track_name TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    album_name TEXT,
    album_image TEXT,
    track_url TEXT NOT NULL,
    duration_ms INTEGER,
    played_at TIMESTAMP NOT NULL UNIQUE,
    linked_activity_id TEXT REFERENCES github_activities(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS spotify_listens_played_at_idx ON spotify_listens(played_at);
CREATE INDEX IF NOT EXISTS spotify_listens_track_idx ON spotify_listens(track_id);
CREATE INDEX IF NOT EXISTS spotify_listens_artist_idx ON spotify_listens(artist_name);
CREATE INDEX IF NOT EXISTS spotify_listens_linked_idx ON spotify_listens(linked_activity_id);

-- Sync Metadata Table
CREATE TABLE IF NOT EXISTS sync_metadata (
    service TEXT PRIMARY KEY,
    last_sync_at TIMESTAMP NOT NULL,
    last_event_id TEXT,
    sync_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Grant permissions (adjust as needed for your Neon setup)
-- GRANT ALL ON github_activities TO your_user;
-- GRANT ALL ON spotify_listens TO your_user;
-- GRANT ALL ON sync_metadata TO your_user;
