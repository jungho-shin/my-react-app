function toWMOApiLink(item) {
    return `https://severeweather.wmo.int/v2/cap-alerts/${item.source.sourceId}/rss.xml`;
}

module.exports = {
    toWMOApiLink
};