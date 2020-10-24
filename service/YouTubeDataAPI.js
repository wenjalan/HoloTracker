const {google} = require('googleapis');
const youtube = google.youtube('v3');

class YouTubeDataAPI {

    // constructor
    // keyCredential: the YouTube Data API key to use
    constructor(keyCredential) {
        this.API_KEY = keyCredential;
    }

    // returns information about a talent's YouTube channel
    // channelId: the id of their youtube channel, can be found in their channel URL
    getInfoForChannel(channelId, callback) {
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
            let channel = response.data.items[0];
            
            // otherwise, return some basic information about the channel
            let info = {
                name: channel.snippet.title,
                subscriberCount: channel.statistics.subscriberCount,
            };

            callback(info);
        });
    }
}

module.exports = YouTubeDataAPI;