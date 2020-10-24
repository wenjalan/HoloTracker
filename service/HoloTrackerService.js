const fs = require('fs');
const YouTubeDataAPI = require('./YouTubeDataAPI');
const KANATA_ID = 'UCZlDXzGoo7d44bwdNObFacg';

// read API key from storage
fs.readFile('key/youtube.key', 'utf-8', function error(err, key) {
    if (err) throw err;
    start(key);
});

function start(key) {
    let youtube = new YouTubeDataAPI(key);
    youtube.getInfoForChannel(KANATA_ID, function Callback(info) {
        console.log(info);
    });
}