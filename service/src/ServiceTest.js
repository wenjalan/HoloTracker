const fs = require('fs');
const YouTubeDataAPI = require('./YouTubeManager');
const HoloTrackerService = require('./HoloTrackerService')
const KANATA_ID = 'UCZlDXzGoo7d44bwdNObFacg';
const FUBUKI_SCATMAN_ID = 'Y1So82y91Yw';
const COCO_THIGHS_ID = 'XxEFEjiAeM4';

// read API key from storage
fs.readFile('key/youtube.key', 'utf-8', function error(err, key) {
    if (err) throw err;
    start(key);
});

function start(key) {
    console.log('### Running tests...');
    let youtube = new YouTubeDataAPI(key);
    // testGetChannel(youtube);
    // testGetVideo(youtube);
    // testGetRecentUploads(youtube);
    // testGetTranslationVideos();
    testRefreshTranslations();
}

function testGetChannel(youtube) {
    youtube.getChannel(KANATA_ID)
    .then(channel => {
        console.log('### testGetChannel()');
        console.log(channel.toString());
    });
}

function testGetVideo(youtube) {
    youtube.getVideo(FUBUKI_SCATMAN_ID)
    .then(video => {
        console.log('### testGetVideo()');
        console.log(video.toString());
    });
}

function testGetRecentUploads(youtube) {
    youtube.getChannel(KANATA_ID)
    .then(kanataCh => {
        youtube.getRecentUploads(kanataCh, 5)
        .then(videos => {
            console.log('### testGetRecentUploads')
            console.log('retrieved ' + videos.length + ' recent uploads');
            for (let video of videos) {
                console.log(video.title);
            }
        })
    });
}

function testGetTranslationVideos() {
    HoloTrackerService.getTranslationsFor(COCO_THIGHS_ID).then(translations => {
        console.log(translations);
    });
}

function testRefreshTranslations() {
    HoloTrackerService.refreshTranslations()
    .then((translations) => {
        console.log('### Translations found:')
        console.log(translations);
    });
}