const express = require('express');
const path = require('path');
const mysql = require('mysql');
const util = require('util');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

const pool = mysql.createPool({
  user: 'root',
  host: 'mysql',
  database: 'your_database',
  password: 'root_password',
  port: 3306,
});

pool.query = util.promisify(pool.query).bind(pool);

app.use(express.json());

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

// legit login without token
app.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE name = ?', [name]);

    if (result.length > 0) {
      const user = result[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Invalid password' });
      }
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
    res.json(result);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// getting a specific user by ID
app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (result.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result[0]);
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// creating a new user
app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    res.status(201).json(result.insertId);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// updating a user
app.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const selectResult = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (selectResult.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updateResult = await pool.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, hashedPassword, userId]);

    if (updateResult.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      const updatedUser = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
      res.json(updatedUser[0]);
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
    const selectResult = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (selectResult.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const deleteResult = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    if (deleteResult.affectedRows === 0) {
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
