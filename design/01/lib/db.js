var mysql = require('mysql');

var db = mysql.createPool({
    host: 'localhost',
    user: 'datacollector',
    password: 'timetable9938!',
    database: 'datacollector',
    timezone: "Asia/Seoul"
});

module.exports = db;