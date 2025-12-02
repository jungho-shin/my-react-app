function getFileName(link) {
    // Get last part of link
    const lastPart = link.substring(link.lastIndexOf('/') + 1);

    // Replace text that can't use at file name
    let validFileName = lastPart.replace(/[\\/:*?"<>|]/g, '');

    // If no extension
    if (!validFileName.includes('.')) {
        validFileName += '.xml';

        return validFileName
    }

    return validFileName
}

module.exports = {
    getFileName
};