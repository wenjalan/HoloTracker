const fs = require('fs');
const Channel = require('./Channel');
const YouTubeDataAPI = require('./YouTubeDataAPI');
const Video = require('./Video');
const KANATA_ID = 'UCZlDXzGoo7d44bwdNObFacg';
const FUBUKI_SCATMAN_ID = 'Y1So82y91Yw';

// read API key from storage
fs.readFile('key/youtube.key', 'utf-8', function error(err, key) {
    if (err) throw err;
    start(key);
});

function start(key) {
    console.log('Starting HoloTracker...');
    let youtube = new YouTubeDataAPI(key);
    testGetChannel(youtube);
    testGetVideo(youtube);
}

function testGetChannel(youtube) {
    console.log('*** testGetChannel ***')
    youtube.getChannel(KANATA_ID, function Callback(channel) {
        console.log(channel);
    });
}

function testGetVideo(youtube) {
    console.log('*** testGetVideo ***')
    youtube.getVideo(FUBUKI_SCATMAN_ID, function Callback(video) {
        console.log(video);
    });
}