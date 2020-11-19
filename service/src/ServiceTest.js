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
    // testGetRecentUploads(youtube, 169);
    // testGetTranslationVideos();
    // testRefreshTranslations();
    // testGetAllVideos(youtube);
    // testRefreshCache10Uploads(youtube);
    testReadCache();
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

function testGetRecentUploads(youtube, limit) {
    youtube.getChannel(KANATA_ID)
    .then(kanataCh => {
        console.log('retrieved channel');
        youtube.getRecentUploads(kanataCh, limit)
        .then(videos => {
            console.log('### testGetRecentUploads')
            console.log('retrieved ' + videos.length + ' recent uploads');
            let x = 0;
            for (let video of videos) {
                console.log(x + ':' + video.title);
                x++;
                if (x % 50 == 0) {
                    console.log();
                }
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
        let totalSources = translations.size;
        let totalTranslations = 0;
        for (let [key, value] of translations.entries()) {
            console.log(key + ' | ' + value);
            totalTranslations += value.length;
        }
        console.log(totalSources + ' total sources, ' + totalTranslations + ' total translations');
    });
}

function testGetAllVideos(youtube) {
    youtube.getChannel(KANATA_ID)
    .then((channel) => {
        youtube.getAllVideos(channel)
        .then((videos) => {
            console.log('loaded ' + videos.length + ' videos');
            for (let video of videos) {
                console.log(video.title);
            }
        });
    })
}

function testRefreshCache10Uploads(youtube) {
    youtube.getChannel(KANATA_ID)
    .then(c => {
        youtube.getRecentUploads(c, 10)
        .then(videos => {
            HoloTrackerService.updateCache(videos);
        })
    })
}

function testReadCache() {
    HoloTrackerService.readCache()
    .then(cache => {
        console.log('Loaded ' + Object.keys(cache).length + ' video entities:');
        for (let id in cache) {
            let video = cache[id];
            console.log("[" + video.id + "] " + video.title);
        }
    });
}