const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
let express = require('express');
let mysql = require('mysql');
let router = express.Router();

/* Database access through SQL conection pooling */
let db_cred = JSON.parse(fs.readFileSync('./db_credentials.json'));
let pool = mysql.createPool({
    connectionLimit: 10,    // Current max 10 connections at a time
    host: db_cred.host,
    user: db_cred.user,
    password: db_cred.password,
    database: db_cred.database
});

/* Available oirigins */
const corsOptions = {
    origin: 'http://ralytan.com'
}

/* Memory Grid Game */
router.get('/api/MemoryGame/scores', cors(corsOptions), function (req, res) {
    pool.getConnection(function(err, connection) {
        if(err) throw err; // Issue connecting
        console.log("Database Connected! -src: MemoryGame/scores [GET]" + logTimeStamp());

        let sql = "SELECT * FROM Memory_Game ORDER BY score DESC";
        connection.query(sql, function(sqlErr, rows, fields){
            if(sqlErr) {
                console.log("SQL Error: " + sqlErr);
                res.sendStatus(500);
                return;
            }
            res.send(rows);
            connection.release();
        });
    });
});

router.post('/api/MemoryGame/scores', cors(corsOptions), function (req, res) {
    let new_name = req.body.name_field;
    let new_score = req.body.score_field;

    pool.getConnection(function(err, connection) {
        if(err) throw err; // Issue connecting
        console.log("Database Connected! -src: MemoryGame/scores [POST] " + logTimeStamp());

        let sql = 'INSERT INTO Memory_Game (name, score) VALUES (' + connection.escape(new_name) + ', ' 
                                                                   + connection.escape(new_score) + ')';
        connection.query(sql, function(sqlErr, result){
            if(sqlErr) {
                console.log("SQL Error: " + sqlErr);
                res.sendStatus(500);
                return;
            }
            connection.release();
        });
    });
});

function logTimeStamp() {
    let today = new Date();
    return today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate() + ' | ' +
           today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds() + ':'
}

module.exports = router;