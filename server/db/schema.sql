CREATE DATABASE IF NOT EXISTS dinamo_db;
USE dinamo_db;

DROP TABLE IF EXISTS beneficiaries;

CREATE TABLE beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gouvernorat VARCHAR(255),
    delegation VARCHAR(255),
    secteur VARCHAR(255),
    annee INT,
    composante VARCHAR(255),
    sous_composante VARCHAR(255),
    activite TEXT,
    sexe VARCHAR(50),
    age INT,
    est_jeune BOOLEAN,
    source_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
