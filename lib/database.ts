/**
 * Database Connection and Query Management
 * Provides connection pooling, transaction support, and error handling
 */

import mysql from 'mysql2/promise';
import { DATABASE_CONFIG } from './config';
import { DatabaseError, parseDatabaseError } from './errors';
import { logError, logInfo, logDebug } from './logger';

// Use centralized configuration
export const dbConfig = DATABASE_CONFIG;

let pool: mysql.Pool | null = null;

/**
 * Get or create database connection pool
 */
export async function getDbConnection(): Promise<mysql.Pool> {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
      logInfo('Database connection pool created', { 
        connectionLimit: dbConfig.connectionLimit 
      });
    } catch (error) {
      logError('Failed to create database connection pool', { error });
      throw new DatabaseError('Failed to create database connection pool');
    }
  }
  return pool;
}

/**
 * Test and ensure connection is alive
 */
export async function ensureConnection(): Promise<mysql.Pool> {
  try {
    const currentPool = await getDbConnection();
    // Test the connection with a simple query
    await currentPool.execute('SELECT 1');
    return currentPool;
  } catch (error) {
    logError('Connection test failed, recreating pool', { error });
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
      role ENUM('vendor', 'ngo', 'volunteer', 'admin') NOT NULL,
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

/**
 * Execute query with retry logic and error handling
 */
export async function executeQuery<T = any>(
  query: string, 
  params: any[] = [], 
  retries: number = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const currentPool = await ensureConnection();
      const [results] = await currentPool.execute(query, params);
      
      logDebug('Query executed successfully', { 
        attempt, 
        query: query.substring(0, 100) 
      });
      
      return results as T;
    } catch (error: any) {
      lastError = error;
      
      logError(error, { 
        context: `Database query attempt ${attempt} failed`,
        query: query.substring(0, 100),
      });
      
      // Check if it's a connection-related error
      const isConnectionError = 
        error.code === 'PROTOCOL_CONNECTION_LOST' || 
        error.code === 'ECONNRESET' || 
        error.code === 'PROTOCOL_ENQUEUE_AFTER_QUIT' ||
        error.code === 'ER_CON_COUNT_ERROR' ||
        error.message?.includes('connection is in closed state') ||
        error.message?.includes('Too many connections');
      
      if (isConnectionError) {
        // Reset pool for connection errors
        pool = null;
        
        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const waitTime = attempt * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } else {
        // Non-connection errors shouldn't be retried
        throw parseDatabaseError(error);
      }
    }
  }
  
  // All retries failed
  throw parseDatabaseError(lastError);
}

// Export query as an alias for backward compatibility
export const query = executeQuery;

/**
 * Begin transaction
 */
export async function beginTransaction(): Promise<mysql.PoolConnection> {
  const currentPool = await ensureConnection();
  const connection = await currentPool.getConnection();
  await connection.beginTransaction();
  return connection;
}

/**
 * Execute query within a transaction
 */
export async function executeInTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    logDebug('Transaction committed successfully');
    return result;
  } catch (error) {
    await connection.rollback();
    logError('Transaction rolled back', { error });
    throw parseDatabaseError(error);
  } finally {
    connection.release();
  }
}

/**
 * Helper function to gracefully close the pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logInfo('Database connection pool closed');
  }
}

/**
 * Health check function
 */
export async function healthCheck(): Promise<{ healthy: boolean; timestamp: string; error?: string }> {
  try {
    await executeQuery('SELECT 1 as health_check');
    return { 
      healthy: true, 
      timestamp: new Date().toISOString() 
    };
  } catch (error) {
    logError('Database health check failed', { error });
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
}
