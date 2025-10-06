CREATE UNIQUE INDEX IF NOT EXISTS blog_feedback_slug_fingerprint_unique ON blog_feedback (slug, fingerprint);
