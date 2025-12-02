function check(inputData) {
    if (inputData.feed && inputData.feed.entry) {
        return { type: 'entry' };
    } else if (inputData.rss && inputData.rss.channel && inputData.rss.channel.item) {
        return { type: 'item' };
    } else if (!inputData.feed.entry || !inputData.rss.channel.item){
        return { error: 'Not supported format or empty feed' };
    }
}

module.exports = {
    check
};