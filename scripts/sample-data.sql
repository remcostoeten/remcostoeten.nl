-- Sample SQL data for testing the PostgreSQL management script
-- Use with: ./scripts/manage/docker-psql.sh import scripts/sample-data.sql

-- Create a sample users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create a sample posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    author_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT false
);

-- Create a sample categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (username, email, is_active) VALUES
('alice', 'alice@example.com', true),
('bob', 'bob@example.com', true),
('charlie', 'charlie@example.com', false),
('diana', 'diana@example.com', true);

INSERT INTO categories (name, description) VALUES
('Technology', 'Posts about technology and programming'),
('Lifestyle', 'Posts about lifestyle and personal experiences'),
('Tutorial', 'How-to guides and tutorials'),
('News', 'Latest news and updates');

INSERT INTO posts (title, content, author_id, published) VALUES
('Getting Started with Docker', 'Docker is a containerization platform...', 1, true),
('PostgreSQL Best Practices', 'Here are some best practices for PostgreSQL...', 2, true),
('Introduction to Bash Scripting', 'Bash scripting is essential for system administration...', 1, false),
('Database Design Principles', 'Good database design is crucial for application performance...', 3, true),
('Container Orchestration with Kubernetes', 'Kubernetes is the leading container orchestration platform...', 2, false);