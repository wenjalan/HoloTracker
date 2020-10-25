const {google} = require('googleapis');
const youtube = google.youtube('v3');
const Channel = require('./Channel');
const Video = require('./Video');

// main interface with the YouTube Data API
class YouTubeDataAPI {

    // constructor
    // keyCredential: the YouTube Data API key to use
    constructor(keyCredential) {
        this.API_KEY = keyCredential;
    }

    // returns a Channel object representing a YouTube channel
    // channelId: the id of their youtube channel, can be found in their channel URL
    // callback: the function to receive the Channel object
    getChannel(channelId, callback) {
        // make a request to YouTube
        youtube.channels.list({
            key: this.API_KEY,
            part: 'snippet,statistics,contentDetails',
            id: channelId,
        }, function onResponse(error, response) {
            // if there was an error, report it
            if (error) {
                console.error('Encountered an error while retrieving channel info for channel id ' + channelId);
                console.error(error);
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
            callback(channel);
        });
    }

    // returns a Video object representing a YouTube video
    // videoId: the id of the video
    // callback: the function to receive the Video object
    getVideo(videoId, callback) {
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
                return;
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

            // return a Video object
            callback(video);
        });
    }

}

module.exports = YouTubeDataAPI;