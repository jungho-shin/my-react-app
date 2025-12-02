var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'datacollector',
    password: 'timetable9938!'
});

connection.connect();

connection.query('DROP DATABASE IF EXISTS datacollector;', function (error, results, fields) {
    if (error) throw error;

    console.log("DROP DATABASE Success.");
});

connection.query('CREATE DATABASE `datacollector`;', function (error, results, fields) {
    if (error) throw error;

    console.log("CREATE DATABASE Success.");
});

connection.query('USE `datacollector`;', function (error, results, fields) {
    if (error) throw error;

    console.log("USE DATABASE Success.");
});

connection.end();
