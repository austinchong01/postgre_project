#! /usr/bin/env node

require('dotenv').config();
const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS clothing (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  size VARCHAR(20) NOT NULL,
  color VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO clothing (name, type, size, color, price) 
VALUES
  ('Cotton T-Shirt', 'T-Shirt', 'M', 'White', 19.99),
  ('Slim Jeans', 'Jeans', 'L', 'Dark Blue', 79.99),
  ('Leather Jacket', 'Jacket', 'M', 'Black', 199.99),
  ('Formal Button-Up Shirt', 'Shirt', 'L', 'White', 45.00),
  ('Denim Jacket', 'Jacket', 'S', 'Light Blue', 75.50),
  ('Hooded Sweatshirt', 'Hoodie', 'XL', 'Red', 55.00),
  ('Plaid Flannel Shirt', 'Shirt', 'L', 'Red', 42.99),
  ('Cargo Pants', 'Pants', 'L', 'Olive', 58.00)
ON CONFLICT DO NOTHING;
`;

async function main() {
  console.log("seeding clothing inventory...");
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();