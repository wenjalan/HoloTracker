const CacheManager = require("../CacheManager");
const YouTubeManager = require("../YouTubeManager");
const KANATA_CH_ID = 'UCZlDXzGoo7d44bwdNObFacg';
const KANATA_VID_ID = '4GYk5nhvcBk';
const KANATA_UPLOADS_ID = 'UUZlDXzGoo7d44bwdNObFacg';

// testSaveEmptyCache();
// testLoadCache();
// testSaveAndLoadChannel();
testSaveAndLoadVideo();

async function testSaveEmptyCache() {
    let emptyCache = new CacheManager.Cache();
    await CacheManager.saveCache(emptyCache);
}

async function testLoadCache() {
    let cache = await CacheManager.loadCache();
    console.log(cache);
}

async function testSaveAndLoadChannel() {
    let channel = await YouTubeManager.getChannelById(KANATA_CH_ID);
    let cache = new CacheManager.Cache();
    await cache.addChannel(channel);
    await CacheManager.saveCache(cache);
    let loadedCache = await CacheManager.loadCache();
    console.log(loadedCache);
}

async function testSaveAndLoadVideo() {
    let video = await YouTubeManager.getVideoById(KANATA_VID_ID);
    let cache = new CacheManager.Cache();
    await cache.addVideo(video);
    await CacheManager.saveCache(cache);
    let loadedCache = await CacheManager.loadCache();
    console.log(loadedCache);
}