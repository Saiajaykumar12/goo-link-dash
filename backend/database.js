import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create Users table
        // Create Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      googleId TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT, 
      name TEXT,
      picture TEXT
    )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                // Migration: Attempt to add password column if it doesn't exist (for existing DBs)
                db.run(`ALTER TABLE users ADD COLUMN password TEXT`, (err) => {
                    // Ignore error if column already exists
                });
            }
        });

        // Create Links table
        db.run(`CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      url TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`, (err) => {
            if (err) {
                console.error('Error creating links table:', err.message);
            }
        });
    }
});

export default db;
