-- Sweety: Blood Glucose Tracking and Reporting System Database Schema

-- Create schema if not exists for clean isolation
CREATE SCHEMA IF NOT EXISTS sweety;
SET search_path TO sweety, public;

-- Drop tables if they exist in reverse order of foreign key dependency
DROP TABLE IF EXISTS sweety.readings CASCADE;
DROP TABLE IF EXISTS sweety.users CASCADE;

-- Create Users table
CREATE TABLE IF NOT EXISTS sweety.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Readings table
CREATE TABLE IF NOT EXISTS sweety.readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES sweety.users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_glucose_range CHECK (glucose_value >= 40 AND glucose_value <= 600),
    CONSTRAINT chk_time_slot CHECK (time_slot IN (
        'Morning (fasting)',
        'After breakfast',
        'After lunch',
        'After dinner'
    )),
    CONSTRAINT uq_user_reading_slot UNIQUE (user_id, reading_date, time_slot)
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sweety_users_email ON sweety.users(email);
CREATE INDEX IF NOT EXISTS idx_sweety_readings_user_id ON sweety.readings(user_id);
CREATE INDEX IF NOT EXISTS idx_sweety_readings_user_date ON sweety.readings(user_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_sweety_readings_user_date_slot ON sweety.readings(user_id, reading_date, time_slot);
