
CREATE DATABASE IF NOT EXISTS sto_tracker;
USE sto_tracker;

CREATE TABLE sto_header (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  po_number VARCHAR(20),
  sto_number VARCHAR(20),
  from_location VARCHAR(30),
  to_location VARCHAR(30),
  remarks TEXT,
  created_by VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified_by VARCHAR(50),
  modified_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sto_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sto_id BIGINT,
  diameter INT,
  material_class VARCHAR(10),
  length DECIMAL(5,2),
  batch VARCHAR(40),
  quantity_mtr INT,
  CONSTRAINT fk_sto FOREIGN KEY (sto_id) REFERENCES sto_header(id)
);
