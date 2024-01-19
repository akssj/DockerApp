const express = require('express');
const path = require('path');
const mysql = require('mysql');
const util = require('util');

const app = express();
const PORT = 8080;

const pool = mysql.createPool({
  user: 'root',
  host: 'mysql',
  database: 'your_database',
  password: 'root',
  port: 3306,
  insecureAuth : true
});

pool.query = util.promisify(pool.query).bind(pool);

app.use(express.json());
app.use(express.static(__dirname));

// retry database connection until succeed
function initializeApp() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection failed:', err, ' retryin in 10sec');
      setTimeout(initializeApp, 10000);
    } else {
      console.log('Database connected successfully');
      connection.release();
      startServer();
    }
  });
}

function startServer() {

  app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });

  pool.on('error', (err) => {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Database Error' });
  });

  // legit login without token
  app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
      const result = await pool.query('SELECT * FROM users WHERE name = ? AND password = ?', [name, password]);

      if (result.length > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Invalid name or password' });
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
      const result = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
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
    const selectResult = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (selectResult.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updateResult = await pool.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, password, userId]);

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

}

initializeApp();