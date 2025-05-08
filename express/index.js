require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
//const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const connect = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
});

connect.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
});

pool.query(`USE ${process.env.DB_NAME}`);
pool.query("CREATE TABLE IF NOT EXISTS users ( user_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), name VARCHAR(255), weight SMALLINT(15), height SMALLINT(15), dailyGoal BOOLEAN, weeklyGoal BOOLEAN )");
pool.query("CREATE TABLE IF NOT EXISTS log ( log_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), activity VARCHAR(255), timestamp TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP, day DATE, start TIME(0), end TIME(0), post VARCHAR(255))");
pool.query("CREATE TABLE IF NOT EXISTS react ( log_id INT, username VARCHAR(255) )");
pool.query("CREATE TABLE IF NOT EXISTS follow ( follower VARCHAR(255) , followee VARCHAR(255) )");

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

app.post('/change-password', async (req, res) => {
    try {
        const { username, password, new_password } = req.body;
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(500).json({ message: 'wrong password' });
        }

        await pool.execute(
            'UPDATE users SET password = ? WHERE username = ?',
            [new_password, username]

        )
        res.json({ message: 'Change password successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/update-profile', async (req, res) => {
    try {
        const { username, name, weight, height, dailyGoal, weeklyGoal } = req.body;
        await pool.execute(
            'UPDATE users SET name = ?, weight = ?, height = ?, dailyGoal = ?, weeklyGoal = ? WHERE username = ?',
            [name, weight, height, dailyGoal, weeklyGoal, username]
        );

        res.json({ message: 'Update successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/get-userinfo', async (req, res) => {
    try {
        const { username } = req.body;

        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Username not found' });
        }

        res.status(200).json({ rows });
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

app.post('/follow', async (req, res) => {
    try {
        const { follower, followee } = req.body;


        const [result] = await pool.execute(
            'insert into follow (follower, followee) values (?, ?)',
            [follower, followee]
        );

        res.status(200).json({ message: 'Follow successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/get-follower', async (req, res) => {
    try {
        const { followee } = req.body;

        const [rows] = await pool.execute(
            'SELECT * FROM follow WHERE followee = ?',
            [followee]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Username not found' });
        }

        let result = [];
        for (let i = 0; i < rows.length; i++) {
            result.push(rows[i].follower);
        }

        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/get-followee', async (req, res) => {
    try {
        const { follower } = req.body;

        const [rows] = await pool.execute(
            'SELECT * FROM follow WHERE follower = ?',
            [follower]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Username not found' });
        }

        let result = [];
        for (let i = 0; i < rows.length; i++) {
            result.push(rows[i].followee);
        }

        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/get-user-rec', async (req, res) => {
    try {
        const { username } = req.body;

        const [followees] = await pool.execute(
            'SELECT * FROM follow WHERE follower = ?',
            [username]
        );

        let exclude = [];
        for (let i = 0; i < followees.length; i++) {
            exclude.push(followees[i].followee);
        }

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username != ?',
            [username]
        );

        let result = [];
        //change length as necessary, 2 for testing
        //implement better randomization
        for (let i = 0; result.length < Math.min(2, users.length-exclude.length); i = Math.floor(Math.random() * users.length)) {
            if (exclude.indexOf(users[i].username) == -1) {
                result.push({ username: users[i].username, name: users[i].name });
            }
        }
        
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/update-log', async (req, res) => {
    try {
        const { log_id, activity, post, day, start, end } = req.body;

        await pool.executes(
            `UPDATE log
            SET activity = ?, post = ?, day = ?, start = ?, end = ?
            WHERE log_id = ?`,
            [activity, post, day, start, end, log_id]
        );
        res.status(200).json({ message: 'Log updated successfully' });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update log',
            details: error.message
        });
    }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));