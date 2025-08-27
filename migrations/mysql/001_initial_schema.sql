-- MySQL Migration 001: Initial Schema for Academy Test Suite
-- Create core lookup tables first

-- Content Status (used by Cert)
CREATE TABLE content_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

INSERT INTO content_status (id, name, description) VALUES 
(1, 'Active', 'Content is active and available'),
(2, 'Draft', 'Content is in draft state'),
(3, 'Archived', 'Content is archived');

-- Company Status (used by Company)
CREATE TABLE company_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

INSERT INTO company_status (id, name, description) VALUES 
(1, 'Active', 'Company is active'),
(2, 'Inactive', 'Company is inactive'),
(3, 'Pending', 'Company registration pending');

-- User Certificate Status (used by UserCertificate)
CREATE TABLE user_certificate_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

INSERT INTO user_certificate_status (id, name, description) VALUES 
(1, 'Issued', 'Certificate has been issued'),
(2, 'Pending', 'Certificate is pending approval'),
(3, 'Revoked', 'Certificate has been revoked'),
(4, 'Expired', 'Certificate has expired');

-- Country table
CREATE TABLE country (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    iso_2 VARCHAR(2) NOT NULL,
    iso_3 VARCHAR(3) NOT NULL,
    market_id INT DEFAULT NULL
);

INSERT INTO country (id, name, iso_2, iso_3) VALUES 
(1, 'United States', 'US', 'USA'),
(2, 'United Kingdom', 'GB', 'GBR'),
(3, 'Germany', 'DE', 'DEU'),
(4, 'France', 'FR', 'FRA'),
(5, 'Canada', 'CA', 'CAN');

-- Company table
CREATE TABLE company (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ce_id VARCHAR(255) NOT NULL,
    ww_id VARCHAR(255) DEFAULT NULL,
    type_id INT NOT NULL DEFAULT 1,
    status_id INT NOT NULL,
    country_id INT DEFAULT NULL,
    log_user_id INT DEFAULT NULL,
    log_date_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES company_status(id),
    FOREIGN KEY (country_id) REFERENCES country(id)
);

INSERT INTO company (id, name, ce_id, status_id, country_id) VALUES 
(1, 'Tech Corp', 'TC001', 1, 1),
(2, 'Global Solutions Ltd', 'GS002', 1, 2),
(3, 'Innovation GmbH', 'IN003', 1, 3);

-- User table
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    keyy VARCHAR(255) NOT NULL,
    password_bcrypt TEXT,
    log_ip VARCHAR(45) NOT NULL,
    log_date_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_admin INT NOT NULL DEFAULT 0,
    status_id INT NOT NULL DEFAULT 1,
    language_id INT NOT NULL DEFAULT 1,
    country_id INT NOT NULL,
    company_id INT DEFAULT NULL,
    simulcation_user_id INT DEFAULT NULL,
    kyi_id VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (country_id) REFERENCES country(id),
    FOREIGN KEY (company_id) REFERENCES company(id)
);

INSERT INTO user (id, first_name, last_name, email, keyy, log_ip, country_id, company_id) VALUES 
(1, 'John', 'Doe', 'john.doe@example.com', 'key001', '127.0.0.1', 1, 1),
(2, 'Jane', 'Smith', 'jane.smith@example.com', 'key002', '127.0.0.1', 2, 2),
(3, 'Admin', 'User', 'admin@example.com', 'key003', '127.0.0.1', 1, 1);

UPDATE user SET is_admin = 1 WHERE id = 3;

-- Cert table
CREATE TABLE cert (
    id INT AUTO_INCREMENT PRIMARY KEY,
    points INT NOT NULL DEFAULT 0,
    badge_id VARCHAR(255) DEFAULT NULL,
    status_id INT NOT NULL,
    log_user_id INT DEFAULT NULL,
    log_date_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES content_status(id),
    FOREIGN KEY (log_user_id) REFERENCES user(id)
);

INSERT INTO cert (id, points, badge_id, status_id, log_user_id) VALUES 
(1, 100, 'BADGE001', 1, 3),
(2, 150, 'BADGE002', 1, 3),
(3, 200, 'BADGE003', 2, 3);

-- UserCertificate table (main complex entity for testing)
CREATE TABLE user_certificate (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cert_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    issued DATETIME DEFAULT NULL,
    expires DATETIME DEFAULT NULL,
    printed DATETIME DEFAULT NULL,
    status_id INT NOT NULL,
    log_user_id INT DEFAULT NULL,
    log_date_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    test_user_id VARCHAR(255) DEFAULT NULL,
    reason TEXT,
    badge_status INT DEFAULT NULL,
    badge_id VARCHAR(255) DEFAULT NULL,
    is_log INT DEFAULT 0,
    log_comment TEXT,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (cert_id) REFERENCES cert(id),
    FOREIGN KEY (status_id) REFERENCES user_certificate_status(id),
    FOREIGN KEY (log_user_id) REFERENCES user(id)
);

INSERT INTO user_certificate (id, user_id, cert_id, score, issued, status_id, log_user_id) VALUES 
(1, 1, 1, 85, NOW(), 1, 3),
(2, 2, 1, 92, NOW(), 1, 3),
(3, 1, 2, 78, NULL, 2, 3),
(4, 2, 3, 88, NOW(), 1, 3);

-- Reset AUTO_INCREMENT to correct values after explicit inserts
ALTER TABLE content_status AUTO_INCREMENT = 4;
ALTER TABLE company_status AUTO_INCREMENT = 4;
ALTER TABLE user_certificate_status AUTO_INCREMENT = 5;
ALTER TABLE country AUTO_INCREMENT = 6;
ALTER TABLE company AUTO_INCREMENT = 4;
ALTER TABLE user AUTO_INCREMENT = 4;
ALTER TABLE cert AUTO_INCREMENT = 4;
ALTER TABLE user_certificate AUTO_INCREMENT = 5;