const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

const pool = new Pool({
  user: 'your_username',
  host: 'postgres',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

app.use(express.json());

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

// fake login
app.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE name = $1', [name]);

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Invalid name' });
    }
  } catch (error) {
    console.error('Error executing login request', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// getting all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// getting a specific user by ID
app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// creating a new user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// updating a user
app.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;
  try {
    const result = await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// deleting a user
app.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ message: 'User deleted successfully' });
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// check if server is running
app.get('/status', (req, res) => {
  res.send('OK');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
