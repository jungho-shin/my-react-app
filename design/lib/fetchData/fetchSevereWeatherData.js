const axios = require('axios');

function getWeatherData() {
    return new Promise((resolve, reject) => {
        axios.get('https://severeweather.wmo.int/json/sources.json', { maxContentLength: Infinity })
            .then(response => {
                resolve(response.data.sources);
            })
            .catch(error => {
                reject(error);
            });
    });
}

module.exports = {
    getWeatherData
};