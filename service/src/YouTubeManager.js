// handles all YouTube Data API v3 interfacing
const fs = require('fs');
const Video = require("./model/Video");
const Channel = require("./model/Channel");
const {google} = require('googleapis');
const youtube = google.youtube('v3');

// returns the YouTube Data API key from disk
function getAPIKey() {
    return new Promise((resolve, reject) => {
        // read API key on init
        fs.readFile('key/youtube.key', 'utf-8', (err, data) => {
            if (err) {
                console.error('Error reading API key from file');
                console.error(err);
                reject(err);
            }
            resolve(data);
        });
    })
}


// retrieves a Video given an id
// videoId: the id of the video to retrieve
// returns: a Promise<Video>
async function getVideoById(videoId) {
    // load the API key if not already loaded
    if (this.API_KEY === undefined) {
        this.API_KEY = await getAPIKey();
    }

    // load video from youtube
    console.log('Retrieving video id ' + videoId);
    return new Promise((resolve, reject) => {
        // make a request to YouTube
        youtube.videos.list({
            key: this.API_KEY,
            part: 'snippet,contentDetails,statistics',
            id: videoId,
        }, (err, res) => {
            // if we encountered an error
            if (err) {
                console.error('Encountered an error while retrieving Video resource');
                console.error(err.statusCode + ':' + err.message);
                reject(err);
            }

            // otherwise retrieve the data and create a Video
            // console.log('Retrieved video resource successfully');
            let data = res.data.items[0];
            let video = new Video({
               title: data.snippet.title,
               description: data.snippet.description,
               id: data.id,
               thumbnail: data.snippet.thumbnails.default,
               views: data.statistics.viewCount,
               duration: data.contentDetails.duration,
            });

            // resolve
            resolve(video);
        });
    });
}

// retrieves a Channel given an id
// returns: a Promise<Channel>
async function getChannelById(channelId) {
    // load the API key if not already loaded
    if (this.API_KEY === undefined) {
        this.API_KEY = await getAPIKey();
    }

    // get the Channel from YouTube
    return new Promise((resolve, reject) => {
        // create request
        youtube.channels.list({
            key: this.API_KEY,
            part: 'snippet,statistics,contentDetails',
            id: channelId,
        }, (err, res) => {
            // if error
            if (err) {
                console.error('Encountered an error while retrieving Channel resource');
                console.error(err.statusCode + ':' + err.message);
                reject(err);
            }

            // create a Channel object
            let data = res.data.items[0];
            let channel = new Channel({
                title: data.snippet.title,
                id: data.id,
                subcount: data.statistics.subscriberCount,
                uploadsPlaylistId: data.contentDetails.relatedPlaylists.uploads,
            });
            resolve(channel);
        });
    });
}

// retrieves an array of Videos from a Playlist
// playlistId: the id of the playlist to retrieve videos from
// returns: a Promise<[Video]>
async function getVideosFromPlaylistId(playlistId, limit) {
    // load the API key if not already loaded
    if (this.API_KEY === undefined) {
        this.API_KEY = await getAPIKey();
    }

    // make a request to YT
    return new Promise((resolve, reject) => {
        // build request
        youtube.playlistItems.list({
            key: this.API_KEY,
            part: 'snippet',
            playlistId: playlistId,
            maxResults: Math.min(50, limit),
        }, async (err, res) => {
            if (err) {
                console.error('Encountered an error while retrieving videos from a playlist');
                console.error(err.statusCode + ':' + err.message);
                reject(err);
            }

            // handle received data
            let itemsRetrieved = [];
            let firstItems = res.data.items;
            itemsRetrieved.push(...firstItems);

            // keep retrieving if there's more to retrieve
            if (limit > 50) {
                let videosToGo = limit - 50;
                let nextPageToken = res.data.nextPageToken;
                while (videosToGo > 0) {
                    let nextRes = await youtube.playlistItems.list({
                        key: this.API_KEY,
                        part: 'snippet',
                        playlistId: playlistId,
                        maxResults: Math.min(videosToGo, 50),
                        pageToken: nextPageToken,
                    });
                    // push items and update token
                    itemsRetrieved.push(...nextRes.data.items);
                    nextPageToken = nextRes.data.nextPageToken;
                    videosToGo -= nextRes.data.items.length;
                }
            }

            // create Video objects out of all retrieved items
            let videoPromises = [];
            for (let item of itemsRetrieved) {
                let promise = getVideoById(item.snippet.resourceId.videoId);
                videoPromises.push(promise);
            }

            // return the video
            resolve(Promise.all(videoPromises));
        })
    });
}

module.exports = {getVideoById, getVideosFromPlaylistId, getChannelById};