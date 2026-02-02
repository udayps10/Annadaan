-- Migration: Aadhaar to Password Authentication for Individual Donors
-- Date: February 2, 2026
-- Description: Adds password authentication support while maintaining backward compatibility

-- Step 1: Add new columns for password authentication
ALTER TABLE `individual_donors`
  ADD COLUMN `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `aadhaar_number`,
  ADD COLUMN `requires_password_update` tinyint(1) DEFAULT '0' AFTER `password_hash`;

-- Step 2: Make aadhaar_number nullable for new users who won't need it
ALTER TABLE `individual_donors`
  MODIFY COLUMN `aadhaar_number` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- Step 3: Mark all existing users as requiring password update
UPDATE `individual_donors`
  SET `requires_password_update` = 1
  WHERE `password_hash` IS NULL;

-- Verification queries (run these to check migration)
-- SELECT COUNT(*) as total_donors FROM individual_donors;
-- SELECT COUNT(*) as needs_password FROM individual_donors WHERE requires_password_update = 1;
-- SELECT COUNT(*) as has_password FROM individual_donors WHERE password_hash IS NOT NULL;
