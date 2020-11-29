const fs = require('fs');
const CACHE_FILE = 'cache/cache.dat';
let shouldRefresh = true;

// Cache class
class Cache {

    // constructor
    constructor() {
        this.channel = {};
        this.video = {};
    }

    // adds a Video to the cache
    addVideo(video) {
        let videoId = video.id;
        this.video[videoId] = video;
    }

    // adds a Channel to the cache
    addChannel(channel) {
        let channelId = channel.id;
        this.channel[channelId] = channel;
    }
}

// loads Cache from disk
// returns: a Promise<Cache>
async function loadCache() {
    return new Promise(async (resolve, reject) => {
        // if the cache hasn't been changed, return the currently loaded Cache
        if (!shouldRefresh) {
            return this.cache;
        }
        // if the cache should refresh, load from disk
        else {
            // read from fs
            fs.readFile(CACHE_FILE, 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                }

                // get cache from json
                let cache = JSON.parse(data);

                // update cache and shouldRefresh
                this.cache = cache;
                shouldRefresh = false;

                // resolve
                resolve(cache);
            });
        }
    });
}

// saves the Cache to disk
// cache: the Cache object to save
// todo: don't save every time cacheVideo or cacheChannel is called
async function saveCache(cache) {
    shouldRefresh = true;
    return new Promise(async (resolve, reject) => {
        let json = JSON.stringify(cache);
        fs.writeFile(CACHE_FILE, json, 'utf8', (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

// saves a Video to the Cache
// video: a Video object
async function cacheVideo(video) {
    // load the cache if we haven't
    if (this.cache === undefined) {
        this.cache = await loadCache();
    }

    // save the video
    this.cache.addVideo(video);

    // save the Cache
    await saveCache(this.cache);
}

// saves a Channel to the Cache
// channel: a Channel object
async function cacheChannel(channel) {
    // load the cache if we haven't
    if (this.cache === undefined) {
        this.cache = await loadCache();
    }

    // save the Channel
    this.cache.addChannel(channel);

    // save the Cache
    await saveCache(this.cache);
}

module.exports = {Cache, saveCache, loadCache, cacheChannel, cacheVideo};