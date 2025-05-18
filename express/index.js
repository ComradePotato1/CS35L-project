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
pool.query("CREATE TABLE IF NOT EXISTS users ( user_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), name VARCHAR(255), profile VARCHAR(255), weight SMALLINT(15), height SMALLINT(15), dailyGoal BOOLEAN, weeklyGoal BOOLEAN )");
pool.query("CREATE TABLE IF NOT EXISTS stats ( username VARCHAR (255), aerobic SMALLINT(15) DEFAULT 0, stretching SMALLINT(15) DEFAULT 0 , strengthening SMALLINT(15) DEFAULT 0, balance SMALLINT(15) DEFAULT 0, rest SMALLINT(15) DEFAULT 0 , other SMALLINT(15) DEFAULT 0 )");
pool.query(`CREATE TABLE IF NOT EXISTS log (log_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), activity VARCHAR(255), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, day DATE, start TIME, duration INT, post VARCHAR(255))`); 
pool.query("CREATE TABLE IF NOT EXISTS react ( log_id INT, username VARCHAR(255) )");
pool.query("CREATE TABLE IF NOT EXISTS follow ( follower VARCHAR(255) , followee VARCHAR(255) )");
//pool.query("CREATE TABLE IF NOT EXISTS requests ( follower VARCHAR(255) , followee VARCHAR(255) )");

app.get('/test', async (req, res) => {
    res.status(200).json({ message: 'test success' });
})

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const profile = "pic-0"
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
            'INSERT INTO users (username, password, profile) VALUES (?, ?, ?)',
            [username, password, profile]
            //[username, hashedPassword]
        );

        await pool.execute('INSERT INTO stats (username) VALUES ?', [username]);

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
        const { username, name, profile, weight, height, dailyGoal, weeklyGoal } = req.body;
        await pool.execute(
            'UPDATE users SET name = ?, profile = ?, weight = ?, height = ?, dailyGoal = ?, weeklyGoal = ? WHERE username = ?',
            [name, profile, weight, height, dailyGoal, weeklyGoal, username]
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
      const { log_id, username, activity, day, start, duration, post } = req.body;

      if (duration <= 0) {
        return res.status(400).json({ error: "Duration must be positive"});
      }

      if (duration > 1440) {
        return res.status(400).json({ error: "Duration exceeds 24 hours"});
      }
  
      if (log_id) {
        // Update existing log
        await pool.execute(
          `UPDATE log 
           SET activity=?, day=?, start=?, duration=?, post=?
           WHERE log_id=? AND username=?`,
          [activity, day, start, duration, post, log_id, username]
        );
        return res.status(200).json({ message: 'Log updated successfully' });
      } else {
        // Create new log
        const [result] = await pool.execute(
          `INSERT INTO log (username, activity, day, start, duration, post)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [username, activity, day, start, duration, post]
        );
        return res.status(200).json({ 
          message: 'Log created successfully',
          log_id: result.insertId 
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.post('/get-log', async (req, res) => {
    try {
        const { username, range_start, range_end } = req.body;
        const placeholders = username.map(() => '?').join(',');
        const [rows] = await pool.execute(
            'SELECT * FROM log WHERE username in (' + placeholders + ') ORDER BY timestamp DESC',
            [...username]
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

app.post('/refresh-stats', async (req, res) => {
    try {
      await pool.execute("DELETE FROM stats");
      await pool.execute('INSERT INTO stats (username) SELECT username FROM users');
      const [result] = await pool.execute("SELECT * FROM log");
      for (let i = 0; i < result.length; i++) {
        const lower = result[i].activity.toLowerCase();
        if (lower.includes("run") || lower.includes('ran')) {
            await pool.execute("UPDATE stats SET aerobic = aerobic+1 WHERE username = ?", 
            [result[i].username]
            );
        } else if (lower.includes("yoga")) {
            await pool.execute("UPDATE stats SET balance = balance+1 WHERE username = ?", 
            [result[i].username]
            );
        } 
        
        else {
            await pool.execute("UPDATE stats SET other = other+1 WHERE username = ?", 
            [result[i].username]
            );
        }
      }
      res.status(200).json({ message: "refresh success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.post('/add-stats', async(req, res) => {
    try {
        const { username, activity } = req.body;
        const lower = activity.toLowerCase();
        if (lower.includes("run") || lower.includes('ran')) {
            await pool.execute("UPDATE stats SET aerobic = aerobic+1 WHERE username = ?", 
            [username]
            );
        } else if (lower.includes("yoga")) {
            await pool.execute("UPDATE stats SET balance = balance+1 WHERE username = ?", 
            [username]
            );
        } else {
            await pool.execute("UPDATE stats SET other = other+1 WHERE username = ?", 
            [username]
            );
        }
        res.status(200).json({ message: "add success" });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

app.post('/get-stats', async (req, res) => {
    try {
      const { username } = req.body;

      const [rows] = await pool.execute(
          'SELECT * FROM stats WHERE username = ?',
          [username]
      );
      const result = rows[0]
      res.status(200).json({ result });
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

app.post('/unreact', async (req, res) => {
    try {
        const { log_id, username } = req.body;


        const [result] = await pool.execute(
            'DELETE FROM react where log_id= ? and username= ?',
            [log_id, username]
        );

        res.status(200).json({ message: 'Unreact successful' });
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
        const { follower, followee, unfollow } = req.body;

        if (unfollow) {
            await pool.execute(
                'delete from follow where follower = ? and followee = ?',
                [follower, followee]
            );
        } else {
            await pool.execute(
                'insert into follow (follower, followee) values (?, ?)',
                [follower, followee]
            );
        }
        

        res.status(200).json({ message: 'Follow successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//note - follower is the one requesting to follow and followee is the one being followed
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

app.post('/get-follow-back', async (req, res) => {
    try {
        const { username } = req.body;
        //following
        const [followee] = await pool.execute(
            'SELECT * FROM follow WHERE follower = ? ORDER BY followee',
            [username]
        );

        const [follower] = await pool.execute(
            'SELECT * FROM follow WHERE followee = ? ORDER BY follower',
            [username]
        );

        

        let result = [];
        let i = 0, j = 0;

        while (i < follower.length && j < followee.length) {
            if (follower[i].follower === followee[j].followee) {
                i++;
                j++;
            } else if (follower[i].follower < followee[j].followee) {
                result.push(follower[i].follower);
                i++;
            } else {
                j++;
            }
        }

        while (i < follower.length) {
            result.push(follower[i].follower);
            i++;
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
        let chosen = [];
        //change length as necessary, 3 for testing
        //implement better randomization
        for (let i = Math.floor(Math.random() * users.length); result.length < Math.min(3, users.length-exclude.length); i = Math.floor(Math.random() * users.length)) {
            if (i != chosen.slice(-1)[0] && exclude.indexOf(users[i].username) == -1) {
                chosen.push(i);
                result.push(users[i].username);
            }
        }
        
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/update-log', async (req, res) => {
    try {
        const { log_id, activity, post, day, start, duration } = req.body;

        await pool.executes(
            `UPDATE log
            SET activity = ?, post = ?, day = ?, start = ?, duration = ?
            WHERE log_id = ?`,
            [activity, post, day, start, duration, log_id]
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