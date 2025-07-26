import mysql from 'mysql2/promise';

export const dbConfig = {
  host: process.env.DB_HOST || '192.168.1.21',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rooor',
  database: process.env.DB_NAME || 'foodrescue',
  port: parseInt(process.env.DB_PORT || '3306'),
};

let connection: mysql.Connection | null = null;

export async function getDbConnection() {
  if (!connection) {
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
  return connection;
}

export async function initializeDatabase() {
  const conn = await getDbConnection();
  
  // Create users table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      user_type ENUM('vendor', 'ngo', 'volunteer', 'admin') NOT NULL,
      status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
      address TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      email_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Create vendor_profiles table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS vendor_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE NOT NULL,
      business_name VARCHAR(255) NOT NULL,
      business_type ENUM('restaurant', 'hotel', 'bakery', 'grocery', 'catering', 'street_vendor', 'other') NOT NULL,
      description TEXT,
      website VARCHAR(255),
      average_daily_available INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create ngo_profiles table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS ngo_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE NOT NULL,
      organization_name VARCHAR(255) NOT NULL,
      registration_number VARCHAR(255),
      focus_area ENUM('homeless', 'children', 'elderly', 'animals', 'general') NOT NULL,
      capacity INT NOT NULL,
      description TEXT,
      website VARCHAR(255),
      service_area_radius INT DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create food_listings table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS food_listings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      quantity INT NOT NULL,
      unit VARCHAR(50) NOT NULL,
      category ENUM('meals', 'bakery', 'produce', 'packaged', 'other') NOT NULL,
      expires_at DATETIME,
      pickup_start_time DATETIME NOT NULL,
      pickup_end_time DATETIME NOT NULL,
      special_instructions TEXT,
      status ENUM('available', 'reserved', 'picked_up', 'expired') DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create pickup_requests table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS pickup_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      listing_id INT NOT NULL,
      ngo_id INT NOT NULL,
      requested_quantity INT NOT NULL,
      pickup_time DATETIME,
      notes TEXT,
      status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES food_listings(id) ON DELETE CASCADE,
      FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables initialized successfully');
}

export async function executeQuery(query: string, params: any[] = []) {
  const conn = await getDbConnection();
  const [results] = await conn.execute(query, params);
  return results;
}
