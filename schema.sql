-- Appwrite Database Schema for Beepin (ΛΞVON OS / B.E.E.P)
-- This file defines the table structures for the Appwrite TablesDB
-- Execute these in Appwrite Console > Database > [Database Name] > Create Table

-- =============================================================================
-- USERS TABLE - Extended user profiles beyond Appwrite Account
-- =============================================================================
-- Collection ID: users
-- Database: sovereign (or appropriate database)

-- Required fields (automatically created by Appwrite):
-- $id (string) - Document ID
-- $createdAt (datetime) - Creation timestamp
-- $updatedAt (datetime) - Last update timestamp
-- $permissions (array) - Access permissions

-- Custom fields for CurrentUser interface:
-- user_id (string) - References Appwrite Account $id
-- syndicate_id (string) - User's syndicate/organization
-- covenant (string) - User's covenant (motion, matter, mind, mythos)
-- xi_balance (number) - Xi currency balance
-- phi_balance (number) - Phi currency balance
-- resonance_score (number) - Resonance score (0-100)
-- mythos_titles (array[string]) - Array of earned titles
-- tithe_rate (number) - Tithe rate (0.01-0.10)
-- pact (string) - Pact tier (Apprentice, Adept, Master, Archon)
-- cogni_ops_remaining (number) - Remaining cognitive operations
-- cogni_ops_limit (number) - Cognitive operations limit
-- has_onboarded (boolean) - Whether user completed onboarding
-- age_of_ascension (boolean) - Ascension status
-- color (string) - User avatar color (hex code)
-- name (string) - Display name (can differ from account name)

-- SQL-like representation (for reference - create via Appwrite Console):
/*
CREATE TABLE users (
  user_id VARCHAR(255) PRIMARY KEY,
  syndicate_id VARCHAR(255),
  covenant ENUM('motion', 'matter', 'mind', 'mythos'),
  xi_balance DECIMAL(10,2) DEFAULT 1000.00,
  phi_balance DECIMAL(10,2) DEFAULT 0.00,
  resonance_score INT DEFAULT 50,
  mythos_titles JSON, -- Array of strings
  tithe_rate DECIMAL(3,3) DEFAULT 0.03,
  pact ENUM('Apprentice', 'Adept', 'Master', 'Archon') DEFAULT 'Apprentice',
  cogni_ops_remaining INT DEFAULT 100,
  cogni_ops_limit INT DEFAULT 100,
  has_onboarded BOOLEAN DEFAULT FALSE,
  age_of_ascension BOOLEAN DEFAULT TRUE,
  color VARCHAR(7) DEFAULT '#6A0DAD',
  name VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES appwrite_accounts($id)
);
*/

-- =============================================================================
-- SYNDICATES TABLE - Organization/Multi-tenant structure
-- =============================================================================
-- Collection ID: syndicates

-- Fields:
-- name (string) - Syndicate display name
-- description (string) - Syndicate description
-- owner_id (string) - Owner's user_id
-- member_count (number) - Number of members
-- created_by (string) - Creator's user_id
-- settings (object) - Syndicate settings/preferences

-- =============================================================================
-- OTHER TABLES (PLACEHOLDER)
-- =============================================================================
-- These tables will be created as needed:
-- - connections (agent connections and relationships)
-- - crews (user groups within syndicates)
-- - agent_templates (reusable agent configurations)
-- - workflow_versions (version control for workflows)
-- - chronicle_events (audit trail and event logging)

-- =============================================================================
-- CLOUD FUNCTIONS MIGRATION NOTES (FOLLOW-UP PASS)
-- =============================================================================
-- Apply these schema additions to align with deployed cloud function writes.
--
-- 1) transactions table:
--    - add `updated_at` (datetime)
--    - ensure `reason` accepts nullable/long text values
--
-- SQL-like reference:
-- ALTER TABLE transactions ADD COLUMN updated_at DATETIME;
--
-- 2) chronicle_events table:
--    process-workflow writes:
--      - event_type (string)
--      - data (string/json payload)
--      - timestamp (datetime string)
--
-- SQL-like reference:
-- ALTER TABLE chronicle_events ADD COLUMN event_type VARCHAR(128);
-- ALTER TABLE chronicle_events ADD COLUMN data TEXT;
--
-- 3) stripe_events table (required by stripe-webhook-handler):
--    - stripe_event_id (string, unique logical key)
--    - stripe_event_type (string)
--    - stripe_created_at (datetime)
--    - payload (text/json string)
--    - created_at (datetime)
--    - updated_at (datetime)
--
-- SQL-like reference:
-- CREATE TABLE stripe_events (
--   stripe_event_id VARCHAR(255) PRIMARY KEY,
--   stripe_event_type VARCHAR(128) NOT NULL,
--   stripe_created_at DATETIME NOT NULL,
--   payload LONGTEXT NOT NULL,
--   created_at DATETIME NOT NULL,
--   updated_at DATETIME NOT NULL
-- );