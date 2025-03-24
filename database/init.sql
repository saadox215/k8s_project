-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS db_ramadane;

-- Utiliser la base de données
USE db_ramadane;

-- Créer la table `prayers`
CREATE TABLE IF NOT EXISTS prayers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  fajr TIME NOT NULL,
  dhuhr TIME NOT NULL,
  asr TIME NOT NULL,
  maghrib TIME NOT NULL,
  isha TIME NOT NULL
);

-- Insérer des données par défaut (optionnel)
INSERT INTO prayers (city, country, fajr, dhuhr, asr, maghrib, isha)
VALUES ('Casablanca', 'Morocco', '05:15', '12:40', '16:45', '18:45', '20:00');