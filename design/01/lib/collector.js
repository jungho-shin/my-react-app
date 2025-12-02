const axios = require('axios');
const path = require('path');
const fs = require('fs');
const logger = require('./utility/logger');
const mkDefaultDir = require('./saveData/mkDefaultDir');
const WMOApi = require('./utility/WMOApi');
const saveData = require('./saveData/saveData');

// Initialize logging
logger.init();

/**
 *
 * @param {String} type
 *      1: RealTime
 *      2: History
 *
 */
function collect(type) {
    console.log('test');

    // Fetch Severeweather JSON data
    axios.get('https://severeweather.wmo.int/json/sources.json', {maxContentLength: Infinity})
        .then(response => {
            logger.d('Severe weather sources fetched successfully');

            const severeweatherJsonData = response.data.sources;

            severeweatherJsonData.forEach(item => {
                // Make default directory
                const defaultDir = mkDefaultDir.mkdir(item);

                // XML file path
                const historyFilePath = path.join(defaultDir.historyFeedTimeFolderPath, 'rss.xml');
                const realTimeFilePath = defaultDir.realFeedTimeLanguageFolderPath;

                // Get WMO API link
                const historyLink = WMOApi.toWMOApiLink(item);
                if (type === '1') {
                    // Get real-time data
                    axios.get(item.source.capAlertFeed)
                        .then(capAlertFeedResponse => {
                            saveData.parseXmlToCapFiles(capAlertFeedResponse.data, realTimeFilePath, item.source.capAlertFeed);
                        })
                        .catch(error => {
                            logger.e(`Error while fetching real-time data | ${item.source.capAlertFeed} | ${error}`);
                        });
                } else if (type === '2') {
                    // Get history data
                    axios.get(historyLink)
                        .then(historyResponse => {
                            fs.writeFileSync(historyFilePath, historyResponse.data);
                            logger.d(`History data saved successfully | ${historyLink}`);
                        })
                        .catch(error => {
                            logger.e(`Error while fetching history data | ${historyLink} | ${error}`);
                        });
                } else {
                    logger.e('Unsupported type')
                }

            });
        })
        .catch(error => {
            logger.e(`Error fetching severe weather sources | https://severeweather.wmo.int/json/sources.json | ${error}`);
        });
}

module.exports = {
    collect
}