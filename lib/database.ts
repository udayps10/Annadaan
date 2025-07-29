import mysql from 'mysql2/promise';

export const dbConfig = {
  host: process.env.DB_HOST || '192.168.1.21',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rooor',
  database: process.env.DB_NAME || 'foodrescue',
  port: parseInt(process.env.DB_PORT || '3306'),
  // Connection pool settings
  connectionLimit: 10,
  queueLimit: 0,
  // Keep alive settings to prevent connection timeout
  keepAliveInitialDelay: 0,
  enableKeepAlive: true,
  // Timeout settings
  acquireTimeout: 60000,
  timeout: 60000,
  // Additional settings for better stability
  reconnect: true,
  charset: 'utf8mb4',
  timezone: 'Z'
};

let pool: mysql.Pool | null = null;

export async function getDbConnection() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
      console.log('Database connection pool created');
    } catch (error) {
      console.error('Database pool creation failed:', error);
      throw error;
    }
  }
  return pool;
}

// Function to test and ensure connection is alive
export async function ensureConnection() {
  try {
    const pool = await getDbConnection();
    // Test the connection with a simple query
    await pool.execute('SELECT 1');
    return pool;
  } catch (error) {
    console.error('Connection test failed, recreating pool:', error);
    // Reset the pool and try again
    pool = null;
    return await getDbConnection();
  }
}

export async function initializeDatabase() {
  const pool = await ensureConnection();
  
  // Create users table
  await pool.execute(`
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
  await pool.execute(`
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
  await pool.execute(`
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
  await pool.execute(`
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
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS pickup_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      listing_id INT NOT NULL,
      ngo_id INT NOT NULL,
      requested_quantity INT NOT NULL,
      pickup_time DATETIME,
      notes TEXT,
      status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
      message TEXT,
      requested_pickup_time DATETIME,
      vendor_response TEXT,
      pickup_photo_url LONGTEXT,
      pickup_photo_filename VARCHAR(255),
      pickup_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES food_listings(id) ON DELETE CASCADE,
      FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create impact_photos table for gallery
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS impact_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(255),
      photo_url LONGTEXT NOT NULL,
      photo_filename VARCHAR(255),
      people_helped INT DEFAULT 0,
      tags JSON,
      date_shared DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_approved BOOLEAN DEFAULT FALSE,
      is_public BOOLEAN DEFAULT TRUE,
      likes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_approved_public (is_approved, is_public),
      INDEX idx_date_shared (date_shared)
    )
  `);
}

export async function executeQuery(query: string, params: any[] = [], retries: number = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const pool = await ensureConnection();
      const [results] = await pool.execute(query, params);
      return results;
    } catch (error: any) {
      lastError = error;
      console.error(`Database query attempt ${attempt} failed:`, error.message);
      
      // Check if it's a connection-related error
      if (error.code === 'PROTOCOL_CONNECTION_LOST' || 
          error.code === 'ECONNRESET' || 
          error.code === 'PROTOCOL_ENQUEUE_AFTER_QUIT' ||
          error.message.includes('connection is in closed state')) {
        console.log('Connection lost, resetting pool...');
        pool = null;
        
        // Wait a bit before retrying (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      } else {
        // If it's not a connection error, don't retry
        throw error;
      }
    }
  }
  
  // If all retries failed, throw the last error
  throw lastError;
}

// Helper function to gracefully close the pool
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

// Health check function
export async function healthCheck() {
  try {
    const result = await executeQuery('SELECT 1 as health_check');
    return { healthy: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
}
