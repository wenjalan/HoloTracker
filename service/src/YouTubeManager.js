const {google} = require('googleapis');
const youtube = google.youtube('v3');
const Channel = require('./model/Channel');
const Video = require('./model/Video');

// main interface with the YouTube Data API
class YouTubeManager {

    // constructor
    // keyCredential: the YouTube Data API key to use
    constructor(keyCredential) {
        this.API_KEY = keyCredential;
    }

    // returns a Channel object representing a YouTube channel
    // channelId: the id of their youtube channel, can be found in their channel URL
    // callback: the function to receive the Channel object
    async getChannel(channelId) {
        return new Promise((resolve, reject) => {
            // make a request to YouTube
            youtube.channels.list({
                key: this.API_KEY,
                part: 'snippet,statistics,contentDetails',
                id: channelId,
            }, function onResponse(error, response) {
                // if there was an error, report it
                if (error) {
                    console.error('Encountered an error while retrieving channel info for channel id ' + channelId);
                    console.error(error.errors[0].message);
                    reject(error);
                    return;
                }

                // retrieve the data
                // for some reason the async nature of JavaScript says I can't just
                // pass this data object through to the Channel constructor, so we do it explicitly
                let data = response.data.items[0];
                let channel = new Channel({
                    title: data.snippet.title,
                    id: data.id,
                    subcount: data.statistics.subscriberCount,
                    uploadsPlaylistId: data.contentDetails.relatedPlaylists.uploads,
                });
                
                // return a Channel object
                resolve(channel);
            });
        });
    }

    // returns a Video object representing a YouTube video
    // videoId: the id of the video
    // callback: the function to receive the Video object
    async getVideo(videoId) {
        return new Promise((resolve, reject) => {
            // console.log('Retrieving video id ' + videoId);
            // make a request to YouTube
            youtube.videos.list({
                key: this.API_KEY,
                part: 'snippet,contentDetails,statistics',
                id: videoId,
            }, function onResponse(error, response) {
                // if there was an error, log it
                if (error) {
                    console.error('Encountered an error while retrieving video info for video id ' + videoId);
                    console.error(error);
                    reject(error);
                }

                // unpack the data
                let data = response.data.items[0];
                let video = new Video({
                    title: data.snippet.title,
                    description: data.snippet.description,
                    id: data.id,
                    thumbnail: data.snippet.thumbnails.default,
                    views: data.statistics.viewCount,
                    duration: data.contentDetails.duration,
                });

                // return the video
                resolve(video);
            });
        });
    }

    // returns an array of Videos containing the recent uploads of a provided channel
    // channel: a Channel object
    // amount: the number of videos to retrieve
    async getRecentUploads(channel, amount, callback) {
        return new Promise((resolve, reject) => {
            // get the Channel's latest uploads playlist from YouTube
            youtube.playlistItems.list({
                key: this.API_KEY,
                part: "snippet",
                playlistId: channel.uploadsPlaylistId,
                maxResults: amount,
            }, (error, response) => {
                if (error) {
                    console.error("Encountered an error while retrieving an uploads playlist");
                    console.error(error);
                    reject(error);
                }

                // retrieve video data
                let promises = [];
                let items = response.data.items;
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    promises.push(this.getVideo(item.snippet.resourceId.videoId));
                }
                // resolve our method-level promise
                resolve(Promise.all(promises));
            });
        });

    }

}

module.exports = YouTubeManager;