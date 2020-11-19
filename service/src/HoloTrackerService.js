const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;
const YouTubeManager = require('./YouTubeManager');
const { youtube } = require('googleapis/build/src/apis/youtube');

// the map of video ids to a list of their translations
const translations = new Map();

// read API key from storage and initialize YouTube
fs.readFile('key/youtube.key', 'utf-8', function error(err, key) {
    if (err) throw err;
    init(key);
})

// API endpoints
function init(key) {
    // init YouTube
    this.youtube = new YouTubeManager(key);

    // start web service
    // channel endpoint
    app.get('/channel', (req, res) => {
        console.log('CHANNEL GET REQUEST FROM ' + req.connection.remoteAddress);
        let id = req.query.id;
        youtube.getChannel(id)
        .then(c => res.send(c))
        .catch(error => res.send(error));
    });

    // video endpoint
    app.get('/video', (req, res) => {
        console.log('VIDEO GET REQUEST FROM ' + req.connection.remoteAddress);
        let id = req.query.id;
        this.youtube.getVideo(id)
        .then(v => res.send(v))
        .catch(error => res.send(error));
    });

    // recent uploads endpoint
    app.get('/recent', (req, res) => {
        console.log('RECENT GET REQUEST FROM ' + req.connection.remoteAddress);
        let channelId = req.query.channelId;
        let amount = req.query.amount;
        this.youtube.getChannel(channelId)
        .then(channel => {
            this.youtube.getRecentUploads(channel, amount)
            .then(videos => res.send(videos));
        }).catch(error => res.send(error));
    });

    app.listen(port, () => {
        console.log('Started at http://localhost:' + port + '/');
    });
}

// retrives videos translate this source video
// videoId: the id of the source video
// returns: an array of Videos
async function getTranslationsFor(videoId) {
    console.log('Getting translation...');
    return new Promise((resolve, reject) => {
        // refresh translations map
        refreshTranslations();

        // if there are no translations, return an empty array
        if (!translations.has(videoId)) {
            resolve([]);
        }

        // return a list of videos that translate this video
        let translationIds = translations.get(videoId);
        let promises = [];
        for (translationVideoId of translationIds) {
            promises.push(youtube.getVideo(translationVideoId));
        }
        resolve(Promise.all(promises));
    });
}

// refreshes the translations map, scanning for new source and translations
async function refreshTranslations() {
    return new Promise(async (resolve, reject) => {
        console.log('Refreshing translations...');
        // refresh sources
        console.log('Scanning talents...');
        await scanTalents()
        .then(async () => {
            // refresh translations
            console.log('Scanning translators...');
            await scanTranslators()
            .then(() => {
                console.log('Refresh complete')
                resolve(translations);
            });
        });
    });
}

// scans talent channels for new source videos
async function scanTalents() {
    return new Promise((resolve, reject) => {
        fs.readFile('assets/talents.json', 'utf-8', (error, data) => {
            // on error
            if (error) {
                console.error('Error loading talent channel ids');
                console.error(error);
                reject(error);
            }

            // get talent Channels
            let talentsList = JSON.parse(data);
            let talentIds = Object.values(talentsList);
            this.youtube.getChannels(talentIds)
            .then(async (channels) => {
                // for each channel
                for (let channel of channels) {
                    // get all (yes all) their uploads
                    await this.youtube.getAllVideos(channel)
                    .then(videos => {
                        console.log('Found ' + videos.length + ' source videos from talent ' + channel.title);
                        // add each video id to our map with an empty array
                        for (let video of videos) {
                            translations.set(video.id, []);
                            // console.log('added source ' + video.id);
                        }
                    })
                }
            })
            .then(resolve);
        })
    });
}

// scans translator channels for new translation videos
async function scanTranslators() {
    return new Promise((resolve, reject) => {
        fs.readFile('assets/translators.json', 'utf-8', (error, data) => {
            // on error
            if (error) {
                console.error('Error loading translator channel ids');
                console.error(error);
                reject(error);
            }
    
            // get translator Channels
            let translatorsList = JSON.parse(data);
            let translatorIds = Object.values(translatorsList);
            console.log(translatorIds);

            // get their channels
            this.youtube.getChannels(translatorIds)
            .then(async (channels) => {
                // for each channel, process their uploads for translations
                console.log('Matching sources and translations...');
                for (let translatorChannel of channels) {
                    // get all their videos (all of them)
                    await this.youtube.getAllVideos(translatorChannel)
                    .then(videos => {
                        // console.log('Found ' + videos.length + ' translation videos from translator ' + translatorChannel.title);
                        let total = 0;
                        // for each of the channel's videos
                        for (let video of videos) {
                            // console.log('found possible translation ' + video.id);
                            // if the description of a video contains a source video id
                            for (let sourceId of translations.keys()) {
                                if (video.description.includes(sourceId)) {
                                    // add this video to the translation of that source id
                                    translations.get(sourceId).push(video.id);
                                    // console.log('+ source: ' + sourceId + ' translation: ' + video.id);
                                    total++;
                                }
                            }
                        }
                        console.log('added ' + total + ' translation videos from translator ' + translatorChannel.title);
                    })
                }
            })
            .then(resolve);
        })
    });
}

// updates the cached videos
// videos: an array of Videos to cache
function updateCache(videos) {
    console.log('Updating cache with ' + videos.length + ' videos');
    // get the currently cached videos
    readCache()
    .then(oldCache => {
        // console.log('Loaded ' + Object.keys(oldCache).length + ' Video entities from cache');
        // for each video, put the video id to its video object
        for (video of videos) {
            let id = video.id;
            oldCache[id] = video;
        }

        // save the cache map
        // console.log('Writing ' + Object.keys(oldCache).length + ' Video entities to cache');
        // throw new Error('Execution stopped by developer');
        writeCache(oldCache);
    });
}

// loads a map of Video IDs mapped to their Video objects from the cache
// returns: an Object with ids mapped to Video objects
function readCache() {
    return new Promise((resolve, reject) => {
        fs.readFile('cache/videos.cache', 'utf8', (error, data) => {
            if (error) {
                console.error('Error reading cache from disk');
                console.error(e);
                reject(error);
            }
            let map = JSON.parse(data);
            console.log('Read ' + Object.keys(map).length + ' Video entities from cache');
            resolve(map);
        })
    });
}

// writes a map of Video IDs mapped to their Video objects to the cache
function writeCache(map) {
    return new Promise((resolve, reject) => {
        // get the JSON
        let json = JSON.stringify(map);
        // write the file
        fs.writeFile('cache/videos.cache', json, 'utf8', error => {
            if (error) {
                console.error('Error saving cache to disk');
                console.error(e);
                reject(error);
            }
            else {
                console.log('Wrote ' + Object.keys(map).length + ' entities to cache');
                resolve();
            }
        });
    });
}

// testing, comment out for production
module.exports = {getTranslationsFor, refreshTranslations, updateCache, readCache, writeCache};