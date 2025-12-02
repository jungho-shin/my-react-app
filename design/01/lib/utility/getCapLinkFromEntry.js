function getLink(entry) {
    let link = null;

    // Check if entry.link exists
    if (entry.link) {
        // If entry.link is an array
        if (Array.isArray(entry.link)) {
            const validTypes = ['application/cap+xml', 'application/common-alerting-protocol+xml'];
            const capXmlLink = entry.link.find(link => link['$'] && validTypes.includes(link['$'].type));

            if (capXmlLink) {
                return capXmlLink['$'].href;
            } else {
                const validRel = ['alternate'];
                const capXmlLink = entry.link.find(link => link['$'] && validRel.includes(link['$'].rel));

                if (capXmlLink) {
                    return capXmlLink;
                }
            }
        } else if (entry.link['$']) { // If entry.link is not an array but has '$' property
            return entry.link['$'].href;
        }
    }
    return link;
}

module.exports = {
    getLink
};