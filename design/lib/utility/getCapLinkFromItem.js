function getLink(item) {
    let link = null;

    // Check if item.link exists
    if (item.link) {
        // If item.link is an array
        if (Array.isArray(item.link)) {
            const validTypes = ['application/cap+xml', 'application/common-alerting-protocol+xml'];
            const capXmlLink = item.link.find(link => link['$'] && validTypes.includes(link['$'].type));

            if (capXmlLink) {
                return capXmlLink['$'].href;
            } else {
                const validRel = ['alternate'];
                const capXmlLink = item.link.find(link => link['$'] && validRel.includes(link['$'].rel));

                if (capXmlLink) {
                    return capXmlLink;
                }
            }
        } else if (item.link['$']) { // If item.link is not an array but has '$' property
            return item.link['$'].href;
        }
    }
    return link;
}

module.exports = {
    getLink
};