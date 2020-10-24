const fs = require('fs');
const {google} = require('googleapis');
const youtube = google.youtube('v3');
const KANATA_ID = 'UCZlDXzGoo7d44bwdNObFacg';

// read API key from storage
fs.readFile('key/youtube.key', 'utf-8', function error(err, data) {
    if (err) throw err;
    start(data);
});

// starts the application
function start(key) {
    // find information on Amane Kanata's channel
    youtube.channels.list({
        key: key,
        part: 'snippet,statistics',
        id: KANATA_ID,
    }, function onResponse(err, response) {
        // on error
        if (err) {
            console.log('Encountered an error: ' + err);
            return;
        }

        // log the response
        const channel = response.data.items[0];
        console.log(channel.snippet.title);
        console.log(channel.statistics.subscriberCount);
    });
}