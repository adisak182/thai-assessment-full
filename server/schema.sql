-- Thai Assessment Database Schema for MySQL / MariaDB
CREATE DATABASE IF NOT EXISTS `thai_assessment` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `thai_assessment`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `username` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `age` INT NULL,
  `gender` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `status` VARCHAR(100) NULL,
  `education_level` VARCHAR(100) NULL,
  `employment_status` VARCHAR(100) NULL,
  `avatar` LONGTEXT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'user',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Level Progress Table
CREATE TABLE IF NOT EXISTS `level_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL UNIQUE,
  `level1_passed` TINYINT(1) NOT NULL DEFAULT 0,
  `level2_passed` TINYINT(1) NOT NULL DEFAULT 0,
  `level3_passed` TINYINT(1) NOT NULL DEFAULT 0,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_lp_user_id` (`user_id`),
  CONSTRAINT `fk_lp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Score History Table
CREATE TABLE IF NOT EXISTS `score_history` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `level` INT NOT NULL DEFAULT 1,
  `skill` VARCHAR(100) NOT NULL,
  `score` FLOAT NOT NULL DEFAULT 0,
  `max_score` FLOAT NOT NULL,
  `taken_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `breakdown` LONGTEXT NULL,
  `detailed_results` LONGTEXT NULL,
  INDEX `idx_sh_user_id` (`user_id`),
  INDEX `idx_sh_skill` (`skill`),
  INDEX `idx_sh_taken_at` (`taken_at`),
  CONSTRAINT `fk_sh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Survey Responses Table
CREATE TABLE IF NOT EXISTS `survey_responses` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NULL,
  `gender` VARCHAR(50) NULL,
  `age` VARCHAR(50) NULL,
  `status` VARCHAR(100) NULL,
  `education_level` VARCHAR(100) NULL,
  `employment_status` VARCHAR(100) NULL,
  `target_group` VARCHAR(100) NULL,
  `district` VARCHAR(100) NULL,
  `province` VARCHAR(100) NULL,
  `design_1` INT NULL,
  `design_2` INT NULL,
  `design_3` INT NULL,
  `design_4` INT NULL,
  `content_1` INT NULL,
  `content_2` INT NULL,
  `content_3` INT NULL,
  `content_4` INT NULL,
  `benefit_1` INT NULL,
  `benefit_2` INT NULL,
  `benefit_3` INT NULL,
  `benefit_4` INT NULL,
  `suggestions` TEXT NULL,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sr_user_id` (`user_id`),
  INDEX `idx_sr_submitted_at` (`submitted_at`),
  CONSTRAINT `fk_sr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Activity Logs Table
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `user_id` VARCHAR(64) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_al_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
