const fetch = require('node-fetch');
/**
 * Fetches  a media URL and returns response
 * Used internally for streaming
 */
async function fetchMedia(url, rangeHeader) {
    const headers = {};
    //Support video/audio range requests
    if (rangeHeader) {
        headers.Range = rangeHeader;
    }

    const response = await fetch(url, {
        method: "GET",
        headers,
        redirect: "follow",
    });

    if (!response.ok && response.status !== 206) {
        throw new Error(`Failed to fetch media: ${response.status}`);
    }
    return response;
}

/**
 * Pipes fetched media response to client response
 */
function pipeMedia(res, mediaResponse) {
    //Preserve important headers
    const headersToCopy = [
        "content-type",
        "content-length",
        "accept-ranges",
        "content-range",
    ];

    headersToCopy.forEach((header) => {
        const value = mediaResponse.headers.get(header);
        if (value) {
            res.setHeader(header, value);
        }
    });
    //Status 206 for partial content, otherwise 200
    res.status(mediaResponse.status === 206 ? 206 : 200);
   
    //stream body
    mediaResponse.body.pipe(res);
}
/**
 * Extracts file extension from a URL or fallback to content-type
 */
function detectFormat(url, contentType) {
    const match = url.match(/\.(\w+)(?:$|\?)/);
    if (match) 
        return match[1].toLowerCase();
        if (!contentType) return "bin";
        return contentType.split("/")[1]?.split(";")[0] || "bin";
    }
    module.exports = {
    fetchMedia,
    pipeMedia,
    detectFormat,
};