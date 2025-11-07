const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

function initDatabase() {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database.');
    }
  });

  // Create employees table
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating employees table:', err.message);
    } else {
      console.log('Employees table ready.');
    }
  });

  // Create devices table
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      owner_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES employees(id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating devices table:', err.message);
    } else {
      console.log('Devices table ready.');
    }
  });

  // Check if database is empty and add sample data
  db.get('SELECT COUNT(*) as count FROM employees', (err, row) => {
    if (!err && row && row.count === 0) {
      console.log('Database is empty. Adding sample data...');
      addSampleData(db);
    }
  });

  return db;
}

function addSampleData(db) {
  // Sample employees
  const employees = [
    { name: 'John Doe', role: 'Developer' },
    { name: 'Jane Smith', role: 'Designer' },
    { name: 'Bob Johnson', role: 'Developer' },
    { name: 'Alice Williams', role: 'Manager' },
    { name: 'Charlie Brown', role: 'Designer' }
  ];

  // Insert employees
  employees.forEach((emp) => {
    db.run('INSERT INTO employees (name, role) VALUES (?, ?)', [emp.name, emp.role], function(err) {
      if (!err && this.lastID) {
        // Add some devices for employees
        if (this.lastID === 1) {
          db.run('INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)', 
            ['MacBook Pro 16"', 'Laptop', this.lastID]);
          db.run('INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)', 
            ['Logitech MX Master 3', 'Peripheral', this.lastID]);
        } else if (this.lastID === 2) {
          db.run('INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)', 
            ['Dell XPS 15', 'Laptop', this.lastID]);
          db.run('INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)', 
            ['iPad Pro', 'Tablet', this.lastID]);
        } else if (this.lastID === 3) {
          db.run('INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)', 
            ['LG UltraWide Monitor', 'Display', this.lastID]);
        } else if (this.lastID === 4) {
          db.run('INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)', 
            ['HP EliteBook', 'Laptop', this.lastID]);
        }
      }
    });
  });

  // Add some unassigned devices
  setTimeout(() => {
    db.run('INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)', 
      ['Mechanical Keyboard', 'Peripheral', null]);
    db.run('INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)', 
      ['External Monitor', 'Display', null]);
    console.log('✓ Sample data added successfully!');
  }, 500);
}

module.exports = { initDatabase };

