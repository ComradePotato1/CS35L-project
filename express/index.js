require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
});



pool.query("CREATE DATABASE IF NOT EXISTS project ");
pool.query("USE project");
pool.query("CREATE TABLE IF NOT EXISTS users ( user_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255) ) ");
pool.query("CREATE TABLE IF NOT EXISTS log ( log_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), activity VARCHAR(255), timestamp TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP, day DATE, start TIME(0), end TIME(0), post VARCHAR(255))");
pool.query("CREATE TABLE IF NOT EXISTS react ( log_id INT, username VARCHAR(255) )");

app.get('/test', async (req, res) => {
    res.status(200).json({ message: 'test success' });
})

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        //const hashedPassword = await bcrypt.hash(password, 10);
        //suspend hashing passwords for simplicity?

        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length > 0) {
            return res.status(401).json({ error: 'User already exists' });
        }

        const [result] = await pool.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, password]
            //[username, hashedPassword]
        );

        res.status(200).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = (password == rows[0].password);
        //const match = await bcrypt.compare(password, rows[0].password);
        //suspend hashing
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0].username;

        res.json({ message: 'Login successful', user, });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/log', async (req, res) => {
    try {
        const { username, activity, day, start, end, post } = req.body;


        const [result] = await pool.execute(
            'insert into log (username, activity, day, start, end, post) values (?, ?, ?, ?, ?, ?)',
            [username, activity, day, start, end, post]
        );

        res.status(200).json({ message: 'Log successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/get-log', async (req, res) => {
    try {
        const { username, range_start, range_end } = req.body;
        const [rows] = await pool.execute(
            'SELECT * FROM log WHERE username = ? ORDER BY timestamp DESC',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Username not found' });
        }

        const result = rows.slice(range_start, range_end);

        let reacts = []
        for (let i = 0; i < result.length; i++) {
            const [row] = await pool.execute(
                'SELECT * FROM react WHERE log_id = ?',
                [result[i].log_id]
            );
            let reduced_row = [];
            for (let i = 0; i < row.length; i++) {
                reduced_row.push(row[i].username);
            }
            reacts.push(reduced_row)
        }

        const combined = result.map((item, index) => ({
            ...item,
            reacts: reacts[index]
        }));

        res.status(200).json({ combined });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/react', async (req, res) => {
    try {
        const { log_id, username } = req.body;


        const [result] = await pool.execute(
            'insert into react (log_id, username) values (?, ?)',
            [log_id, username]
        );

        res.status(200).json({ message: 'React successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/get-react', async (req, res) => {
    try {
        const { log_id } = req.body;

        const [rows] = await pool.execute(
            'SELECT * FROM react WHERE log_id = ?',
            [log_id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Username not found' });
        }

        let result = [];
        for (let i = 0; i < rows.length; i++) {
            result.push(rows[i].username);
        }

        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));