const mysql = require('mysql2');

require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:{
        rejectUnauthorized: false
    },
    waitForConnections:true,
    connectionLimit:10,
    queueLimit: 0,
    enableKeepAlive:true,
    keepAliveInitialDelay:10000
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed', err.message);
        return;
    }
    console.log('Connected to Aiven MySQL database');
    connection.release();
    });


db.on('error', (err) => {
    console.error('Unexpected database error:', err.message);
    if(err.code === 'PROTOCOL_CONNECTION_LOST'){
        console.log('Connection lost, pool will create a new one automatically');
    }
});

module.exports = db;