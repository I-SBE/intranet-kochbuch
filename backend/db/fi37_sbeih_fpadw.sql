-- --------------------------------------------------
-- SQL Dump für Projekt: Intranet-Kochbuch
-- --------------------------------------------------

-- 1. Create Database: with Name: fi37_sbeih_fpadw

CREATE DATABASE IF NOT EXISTS fi37_sbeih_fpadw
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE fi37_sbeih_fpadw;

-----------------------------------------------------

-- 2. Create Table: users

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  image_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-----------------------------------------------------

-- 3. Create Table: recipes

CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-----------------------------------------------------

-- 4. Create Table: recipe_images

CREATE TABLE IF NOT EXISTS recipe_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-----------------------------------------------------

-- 5. Create Table: comments

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-----------------------------------------------------

-- for the Import in DB:

-- mysql -u root -p < db/fi37_sbeih_fpadw.sql