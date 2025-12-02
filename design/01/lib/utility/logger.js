// Require libraries
const fs = require('fs');
const path = require("path");

// Log folder path
const logFolderPath = path.join(`${__dirname}/../`, 'logs')

// Log file path
const logFilePath = path.join(`${__dirname}/../`, 'logs', 'output.log');

// Log error file path
const errorFilePath = path.join(logFolderPath, 'error.log');

// Log folder init function
function init() {
    fs.mkdirSync(logFolderPath, {recursive: true});
    d(`Folder created successfully: ${logFolderPath}`);

    // Log initial message indicating the start of the script
    d('Script started.');
}

// Log message
function d(msg) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${msg}\n`;

    // Append log message to the log file
    fs.appendFileSync(logFilePath, logMessage);

    console.log(msg);
}

// Log error message
function e(msg) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${msg}\n`;

    // Append error message to the error log file
    fs.appendFileSync(errorFilePath, logMessage);

    console.log(msg);
}

module.exports = {
    init,
    d,
    e
};