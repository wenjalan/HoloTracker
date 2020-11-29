const KANATA_CH_ID = 'UCZlDXzGoo7d44bwdNObFacg';
const KANATA_VID_ID = '4GYk5nhvcBk';
const KANATA_UPLOADS_ID = 'UUZlDXzGoo7d44bwdNObFacg';

const YouTubeManager = require('../YouTubeManager');

// run tests
// testGetVideo();
// testGetChannel();
testGetPlaylistVideos();

async function testGetVideo() {
    console.log('### testGetVideo');
    let video = await YouTubeManager.getVideoById(KANATA_VID_ID);
    console.log(video);
}

async function testGetChannel() {
    console.log('### testGetChannel');
    let channel = await YouTubeManager.getChannelById(KANATA_CH_ID);
    console.log(channel)
}

async function testGetPlaylistVideos() {
    console.log('### testGetPlaylistVideos');
    let videos = await YouTubeManager.getVideosFromPlaylistId(KANATA_UPLOADS_ID, 5);
    console.log(videos);
}