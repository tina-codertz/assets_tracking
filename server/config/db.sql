-- Users table 
CREATE TABLE users (
id SERIAL PRIMARY KEY, 
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'agent')),
is_verified BOOLEAN DEFAULT FALSE,
reset_password_token VARCHAR(255),
reset_password_expires TIMESTAMP, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ); 
-- Create updated_at trigger 
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ language 'plpgsql';
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Insert sample users (password: Test@123) 
INSERT INTO users (email, password, role, is_verified) 
VALUES ('admin@example.com', '$2b$10$YourHashedPasswordHere', 'admin', true), 
('manager@example.com', '$2b$10$YourHashedPasswordHere', 'manager', true),
 ('agent@example.com', '$2b$10$YourHashedPasswordHere', 'agent', true);