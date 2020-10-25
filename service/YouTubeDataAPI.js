const {google} = require('googleapis');
const youtube = google.youtube('v3');
const {Channel} = require('./Channel');
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
    getChannel(channelId, callback) {
        // make a request to YouTube
        youtube.channels.list({
            key: this.API_KEY,
            part: 'snippet,statistics',
            id: channelId,
        }, function onResponse(error, response) {
            // if there was an error, report it
            if (error) {
                console.error('Encountered an error while retrieving channel info for channel id ' + channelId);
                console.error(error);
                return;
            }

            // retrieve the data
            let channel = new Channel(response.data.items[0]);
            
            // return a Channel object
            callback(channel);
        });
    }

    getVideo(videoId, callback) {

    }

}

module.exports = YouTubeDataAPI;