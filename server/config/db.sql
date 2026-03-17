CREATE TABLE users (
id SERIAL PRIMARY KEY, 
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'agent')),
is_verified BOOLEAN DEFAULT FALSE,
reset_password_token VARCHAR(255),
reset_password_expires TIMESTAMP, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ); 
-- Create updated_at trigger 
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ language 'plpgsql';
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Customers table (managed primarily by agents)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  id_number VARCHAR(100),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Assets table (created and managed by admin)
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  initial_value NUMERIC(12,2) NOT NULL,
  allocated_amount NUMERIC(12,2) NOT NULL, -- total payable by customer (includes profit)
  profit_margin NUMERIC(5,2),              -- optional percentage margin
  installment_plan VARCHAR(20) NOT NULL CHECK (installment_plan IN ('daily','weekly','monthly')),
  installment_amount NUMERIC(12,2) NOT NULL,
  duration_periods INTEGER NOT NULL,       -- number of installments
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Contracts/Allocations (asset assigned to customer under pay-as-you-go)
CREATE TABLE IF NOT EXISTS asset_contracts (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES assets(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  agent_id INTEGER NOT NULL REFERENCES users(id),
  manager_id INTEGER REFERENCES users(id),
  allocated_amount NUMERIC(12,2) NOT NULL,
  installment_plan VARCHAR(20) NOT NULL CHECK (installment_plan IN ('daily','weekly','monthly')),
  installment_amount NUMERIC(12,2) NOT NULL,
  duration_periods INTEGER NOT NULL,
  total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, completed, defaulted, cancelled
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_end_date DATE,
  next_due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_asset_contracts_updated_at
BEFORE UPDATE ON asset_contracts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Payments made against a contract
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER NOT NULL REFERENCES asset_contracts(id),
  amount NUMERIC(12,2) NOT NULL,
  paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50),
  reference VARCHAR(255),
  recorded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

