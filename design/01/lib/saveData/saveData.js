const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const entryOrItem = require('../utility/entryOrItem');
const logger = require('../utility/logger');
const getCapLinkFromItem = require('../utility/getCapLinkFromItem');
const getCapLinkFromEntry = require('../utility/getCapLinkFromEntry');
const getFileNameFromLink = require('../utility/getFileNameFromLink');

let timeout = 10;

/**
 * Function to parse XML to CAP files and save
 * @param {string} xmlData - The XML data to parse
 * @param {string} realTimeFilePath - The path to save the CAP files
 * @param {string} feedLink - The link of the feed
 */
function parseXmlToCapFiles(xmlData, realTimeFilePath, feedLink) {
    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(xmlData, (error, jsonData) => {
        if (error) {
            logger.e(`Error parsing XML to JSON | ${feedLink} | ${error}`);
        } else {
            const form = entryOrItem.check(jsonData);
            if (form.type === 'entry') {
                handleEntryData(jsonData, realTimeFilePath, feedLink);
            } else if (form.type === 'item') {
                handleItemData(jsonData, realTimeFilePath, feedLink);
            } else {
                logger.d(`${form.error} | ${feedLink}`);
            }
        }
    });
}

/**
 * Handle entry data from the parsed JSON
 * @param {Object} jsonData - Parsed JSON data
 * @param {string} realTimeFilePath - The path to save the CAP files
 * @param {string} feedLink - The link of the feed
 */
function handleEntryData(jsonData, realTimeFilePath, feedLink) {
    if (jsonData.feed.entry) {
        const entries = Array.isArray(jsonData.feed.entry) ? jsonData.feed.entry : [jsonData.feed.entry];
        entries.forEach(entry => {
            const entryLink = getCapLinkFromEntry.getLink(entry);
            saveCapFile(entryLink, realTimeFilePath, entry.link);
        });
    } else {
        logger.e(`No entry found in the feed | ${feedLink}`);
    }
}

/**
 * Handle item data from the parsed JSON
 * @param {Object} jsonData - Parsed JSON data
 * @param {string} realTimeFilePath - The path to save the CAP files
 * @param {string} feedLink - The link of the feed
 */
function handleItemData(jsonData, realTimeFilePath, feedLink) {
    if (jsonData.rss.channel.item) {
        const items = Array.isArray(jsonData.rss.channel.item) ? jsonData.rss.channel.item : [jsonData.rss.channel.item];
        items.forEach(item => {
            const itemLink = getCapLinkFromItem.getLink(item);
            saveCapFile(itemLink, realTimeFilePath, item.link);
        });
    } else {
        logger.e(`No item found in the feed | ${feedLink}`);
    }
}

/**
 * Function to save CAP file
 * @param {string} link - The link of the CAP file
 * @param {string} realTimeFilePath - The path to save the CAP files
 * @param {string} temp
 */
function saveCapFile(link, realTimeFilePath, temp) {
    timeout = timeout + 10;
    setTimeout(() => { // 300ms의 지연 추가
        axios.get(link)
            .then(response => {
                const capFileName = getFileNameFromLink.getFileName(link);
                const capFilePath = path.join(realTimeFilePath, capFileName);

                fs.writeFile(capFilePath, response.data, (error) => {
                    if (error) {
                        logger.e(`Error writing CAP file | ${link} | ${error}`);
                    } else {
                        logger.d(`CAP file written successfully | ${capFilePath}`);
                    }
                });
            })
            .catch(error => {
                logger.e(`Error fetching CAP file data | ${link} | ${error}`);
                if(`${error}` === "AggregateError") {
                    console.log('error:', error, 'temp:', temp);
                    console.log('link:', link);
                    console.log(realTimeFilePath)
                    process.exit(3);
                }
            });
    }, timeout);
}

module.exports = {
    parseXmlToCapFiles
};