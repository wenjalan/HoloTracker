const fs = require('fs');
const Channel = require('./Channel');
const YouTubeDataAPI = require('./YouTubeDataAPI');
const Video = require('./Video');
const KANATA_ID = 'UCZlDXzGoo7d44bwdNObFacg';
const FUBUKI_SCATMAN_ID = 'Y1So82y91Yw';

let c = new Channel();

// read API key from storage
fs.readFile('key/youtube.key', 'utf-8', function error(err, key) {
    if (err) throw err;
    start(key);
});

function start(key) {
    let youtube = new YouTubeDataAPI(key);
    // console.log(Channel);
    // testGetChannel(youtube);
    // testGetVideoInfo();
}

function testGetChannel(youtube) {
    youtube.getChannel(KANATA_ID, function Callback(channel) {
        console.log(channel);
    });
}

function getVideo(youtube) {
    youtube.getInfoForVideo()
}