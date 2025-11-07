const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors());

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize database
const db = initDatabase();

// Employee Routes
app.get('/api/employees', (req, res) => {
  const { role, name } = req.query;
  let query = 'SELECT * FROM employees';
  const conditions = [];
  const params = [];

  // Debug: log the received query parameters
  console.log('Received query params - role:', role, 'name:', name, 'type of name:', typeof name);

  if (role && typeof role === 'string' && role.trim()) {
    conditions.push('role = ?');
    params.push(role.trim());
  }

  if (name && typeof name === 'string' && name.trim()) {
    conditions.push('name LIKE ? COLLATE NOCASE');
    params.push(`%${name.trim()}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY id DESC';

  console.log('Final Query:', query);
  console.log('Final Params:', params);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/employees', (req, res) => {
  const { name, role } = req.body;
  if (!name || !role) {
    res.status(400).json({ error: 'Name and role are required' });
    return;
  }

  db.run(
    'INSERT INTO employees (name, role) VALUES (?, ?)',
    [name, role],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, role });
    }
  );
});

app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  if (!name || !role) {
    res.status(400).json({ error: 'Name and role are required' });
    return;
  }

  db.run(
    'UPDATE employees SET name = ?, role = ? WHERE id = ?',
    [name, role, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.json({ id: parseInt(id), name, role });
    }
  );
});

app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  
  // First, unassign all devices from this employee
  db.run('UPDATE devices SET owner_id = NULL WHERE owner_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Then delete the employee
    db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.json({ message: 'Employee deleted successfully' });
    });
  });
});

// Device Routes
app.get('/api/devices', (req, res) => {
  const { type, owner_id, name } = req.query;
  let query = `
    SELECT d.*, e.name as owner_name, e.role as owner_role
    FROM devices d
    LEFT JOIN employees e ON d.owner_id = e.id
  `;
  const conditions = [];
  const params = [];

  // Debug: log the received query parameters
  console.log('Devices - Received query params - type:', type, 'owner_id:', owner_id, 'name:', name, 'type of name:', typeof name);

  if (type && typeof type === 'string' && type.trim()) {
    conditions.push('d.type = ?');
    params.push(type.trim());
  }

  if (owner_id) {
    conditions.push('d.owner_id = ?');
    params.push(owner_id);
  }

  if (name && typeof name === 'string' && name.trim()) {
    conditions.push('d.name LIKE ? COLLATE NOCASE');
    params.push(`%${name.trim()}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY d.id DESC';

  console.log('Devices Final Query:', query);
  console.log('Devices Final Params:', params);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/devices/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT d.*, e.name as owner_name, e.role as owner_role
     FROM devices d
     LEFT JOIN employees e ON d.owner_id = e.id
     WHERE d.id = ?`,
    [id],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Device not found' });
        return;
      }
      res.json(row);
    }
  );
});

app.post('/api/devices', (req, res) => {
  const { name, type, owner_id } = req.body;
  if (!name || !type) {
    res.status(400).json({ error: 'Name and type are required' });
    return;
  }

  // Validate owner_id if provided
  if (owner_id) {
    db.get('SELECT id FROM employees WHERE id = ?', [owner_id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(400).json({ error: 'Invalid owner_id' });
        return;
      }
      insertDevice();
    });
  } else {
    insertDevice();
  }

  function insertDevice() {
    db.run(
      'INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)',
      [name, type, owner_id || null],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, name, type, owner_id: owner_id || null });
      }
    );
  }
});

app.put('/api/devices/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, owner_id } = req.body;
  if (!name || !type) {
    res.status(400).json({ error: 'Name and type are required' });
    return;
  }

  // Validate owner_id if provided
  if (owner_id) {
    db.get('SELECT id FROM employees WHERE id = ?', [owner_id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(400).json({ error: 'Invalid owner_id' });
        return;
      }
      updateDevice();
    });
  } else {
    updateDevice();
  }

  function updateDevice() {
    db.run(
      'UPDATE devices SET name = ?, type = ?, owner_id = ? WHERE id = ?',
      [name, type, owner_id || null, id],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (this.changes === 0) {
          res.status(404).json({ error: 'Device not found' });
          return;
        }
        res.json({ id: parseInt(id), name, type, owner_id: owner_id || null });
      }
    );
  }
});

app.delete('/api/devices/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM devices WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }
    res.json({ message: 'Device deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use.`);
    console.error(`Please free the port by running: lsof -ti:${PORT} | xargs kill -9`);
    console.error(`Or change the PORT in server.js\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

