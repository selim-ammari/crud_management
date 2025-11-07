/**
 * Seed script to add sample data to the database
 * Run with: node server/seed.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database.');
});

// Sample employees
const employees = [
  { name: 'John Doe', role: 'Developer' },
  { name: 'Jane Smith', role: 'Designer' },
  { name: 'Bob Johnson', role: 'Developer' },
  { name: 'Alice Williams', role: 'Manager' },
  { name: 'Charlie Brown', role: 'Designer' }
];

// Sample devices
const devices = [
  { name: 'MacBook Pro 16"', type: 'Laptop', owner_id: 1 },
  { name: 'Dell XPS 15', type: 'Laptop', owner_id: 2 },
  { name: 'Logitech MX Master 3', type: 'Peripheral', owner_id: 1 },
  { name: 'LG UltraWide Monitor', type: 'Display', owner_id: 3 },
  { name: 'iPad Pro', type: 'Tablet', owner_id: 2 },
  { name: 'Mechanical Keyboard', type: 'Peripheral', owner_id: null },
  { name: 'HP EliteBook', type: 'Laptop', owner_id: 4 }
];

// Clear existing data (optional - comment out if you want to keep existing data)
db.serialize(() => {
  db.run('DELETE FROM devices', (err) => {
    if (err) console.error('Error clearing devices:', err.message);
  });
  
  db.run('DELETE FROM employees', (err) => {
    if (err) console.error('Error clearing employees:', err.message);
  });

  // Insert employees
  const insertEmployee = db.prepare('INSERT INTO employees (name, role) VALUES (?, ?)');
  
  employees.forEach((emp, index) => {
    insertEmployee.run([emp.name, emp.role], function(err) {
      if (err) {
        console.error(`Error inserting employee ${emp.name}:`, err.message);
      } else {
        console.log(`✓ Inserted employee: ${emp.name} (ID: ${this.lastID})`);
        
        // Insert devices for this employee if they have one
        const employeeDevices = devices.filter(d => d.owner_id === index + 1);
        employeeDevices.forEach(device => {
          const insertDevice = db.prepare('INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)');
          insertDevice.run([device.name, device.type, this.lastID], (err) => {
            if (err) {
              console.error(`Error inserting device ${device.name}:`, err.message);
            }
          });
          insertDevice.finalize();
        });
      }
    });
  });
  
  insertEmployee.finalize();

  // Insert unassigned devices
  setTimeout(() => {
    const unassignedDevices = devices.filter(d => d.owner_id === null);
    const insertDevice = db.prepare('INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)');
    
    unassignedDevices.forEach(device => {
      insertDevice.run([device.name, device.type, null], function(err) {
        if (err) {
          console.error(`Error inserting device ${device.name}:`, err.message);
        } else {
          console.log(`✓ Inserted device: ${device.name} (ID: ${this.lastID}, Unassigned)`);
        }
      });
    });
    
    insertDevice.finalize();
    
    // Close database
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('\n✅ Database seeded successfully!');
          console.log(`   - ${employees.length} employees added`);
          console.log(`   - ${devices.length} devices added`);
        }
      });
    }, 500);
  }, 1000);
});

