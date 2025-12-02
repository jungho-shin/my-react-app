const path = require("path");
const fs = require("fs");
const logger = require("../utility/logger");

function getFeedTimeString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function mkdir(item) {
    // Extract folder and file paths
    const dataFolderPath = path.join(`${__dirname}/..`, 'data');
    const countryFolderPath = path.join(dataFolderPath, item.source.countryName);
    const historyFolderPath = path.join(countryFolderPath, 'History');
    const realTimeFolderPath = path.join(countryFolderPath, 'RealTime');
    const historyFeedTimeFolderPath = path.join(historyFolderPath, getFeedTimeString());
    const realFeedTimeFolderPath = path.join(realTimeFolderPath, getFeedTimeString());

    // Create folder by sync
    createFolderSync(dataFolderPath);
    createFolderSync(countryFolderPath);
    createFolderSync(historyFolderPath);
    createFolderSync(realTimeFolderPath);
    createFolderSync(realFeedTimeFolderPath);
    createFolderSync(historyFeedTimeFolderPath);

    let realTimeLanguageFolderPath = null

    // Iterate over each language and create folders
    item.source.byLanguage.forEach(language => {
        realTimeLanguageFolderPath = path.join(realFeedTimeFolderPath, language.code);

        createFolderSync(realTimeLanguageFolderPath);
    });

    return {
        historyFeedTimeFolderPath: historyFeedTimeFolderPath,
        realFeedTimeLanguageFolderPath: realTimeLanguageFolderPath
    };
}

function createFolderSync(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, {recursive: true});
        logger.d(`Folder created successfully: ${folderPath}`);
    }
}


module.exports = {
    mkdir
};