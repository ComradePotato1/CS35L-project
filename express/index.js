const express = require("express");
const bodyParser = require('body-parser');
const axios = require("axios");
const mysql = require('mysql2');
const cors = require('cors');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'devx',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the MySQL database.');
    }
});

db.query("CREATE DATABASE IF NOT EXISTS user ", (err, result) => { });
db.query("USE user ", (err, result) => { });
db.query("CREATE TABLE IF NOT EXISTS history ( hist_id INT AUTO_INCREMENT PRIMARY KEY, input VARCHAR(255), lang VARCHAR(255) ) ", (err, result) => { });