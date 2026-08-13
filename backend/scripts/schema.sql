-- PostgreSQL Schema for Military Asset Management System

-- Drop tables if exists (in reverse dependency order)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS expenditures CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS initial_inventory CASCADE;
DROP TABLE IF EXISTS equipment_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS bases CASCADE;

-- Bases Table
CREATE TABLE bases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL
);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER')),
    base_id INT REFERENCES bases(id) ON DELETE SET NULL
);

-- Equipment Categories / Types
CREATE TABLE equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('WEAPON', 'VEHICLE', 'AMMUNITION'))
);

-- Initial Inventory Table (Opening Balance baseline)
CREATE TABLE initial_inventory (
    id SERIAL PRIMARY KEY,
    base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INT REFERENCES equipment_types(id) ON DELETE CASCADE,
    opening_balance INT NOT NULL DEFAULT 0,
    CONSTRAINT unique_base_equipment UNIQUE(base_id, equipment_type_id)
);

-- Purchases Table
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INT REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    purchased_by INT REFERENCES users(id) ON DELETE SET NULL
);

-- Transfers Table
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    source_base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    destination_base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INT REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    initiated_by INT REFERENCES users(id) ON DELETE SET NULL
);

-- Assignments Table (Assigned to personnel)
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INT REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    assigned_to VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT REFERENCES users(id) ON DELETE SET NULL
);

-- Expenditures Table (Consumed inventory like ammunition)
CREATE TABLE expenditures (
    id SERIAL PRIMARY KEY,
    base_id INT REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INT REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logged_by INT REFERENCES users(id) ON DELETE SET NULL
);

-- System Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Foreign Key Indexes for high-query fields
CREATE INDEX idx_users_base ON users(base_id);
CREATE INDEX idx_purchases_base ON purchases(base_id);
CREATE INDEX idx_purchases_eq ON purchases(equipment_type_id);
CREATE INDEX idx_transfers_src ON transfers(source_base_id);
CREATE INDEX idx_transfers_dest ON transfers(destination_base_id);
CREATE INDEX idx_assignments_base ON assignments(base_id);
CREATE INDEX idx_expenditures_base ON expenditures(base_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
