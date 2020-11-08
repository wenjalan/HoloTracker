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
    async getRecentUploads(channel, amount) {
        return new Promise((resolve, reject) => {
            // get the Channel's latest uploads playlist from YouTube
            youtube.playlistItems.list({
                key: this.API_KEY,
                part: "snippet",
                playlistId: channel.uploadsPlaylistId,
                maxResults: amount,
            }, async (error, response) => {
                if (error) {
                    console.error("Encountered an error while retrieving an uploads playlist (1)");
                    console.error(error);
                    reject(error);
                }

                // retrieve video data
                let promises = [];
                let items = [];
                items.push(...response.data.items);
                let nextPageToken = response.data.nextPageToken;
                
                // if we need to retrieve more videos, do so
                let retrievedAll = false;
                while (items.length <= amount && !retrievedAll) {
                    let toRetrieve = Math.min(50, amount - items.length);
                    if (toRetrieve == 0) {
                        break;
                    }
                    // console.log('getting ' + toRetrieve + ' more items...');
                    await youtube.playlistItems.list({
                        key: this.API_KEY,
                        part: 'snippet',
                        playlistId: channel.uploadsPlaylistId,
                        maxResults: toRetrieve,
                        pageToken: nextPageToken,
                    }).then((response) => {
                        // retrieve the items and add to our list
                        let retrievedItems = response.data.items;

                        // push all items
                        items.push(...retrievedItems);

                        // check if we've seen all the videos
                        if (response.data.nextPageToken == null) {
                            retrievedAll = true;
                        }
                        else {
                            nextPageToken = response.data.nextPageToken;
                        }
                    });
                }

                // console.log('found ' + items.length + ' videos in total');

                // get video objects for all retrieved videos
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    promises.push(this.getVideo(item.snippet.resourceId.videoId));
                }
                // resolve our method-level promise
                resolve(Promise.all(promises));
            });
        });
    }

    // retrives several Channels at once
    // channelIds: an array of channel ids to retrieve
    // returns: a Promise containing an array of Channels
    async getChannels(channelIds) {
        // console.log('channelIds:' + channelIds);
        let promises = [];
        for (let id of channelIds) {
            promises.push(this.getChannel(id));
        }
        return Promise.all(promises);
    }

    // retrieve ALL the videos on a Channel
    // channel: a Channel object
    // returns: an array of Videos
    async getAllVideos(channel) {
        // todo: actually return all the videos
        return this.getRecentUploads(channel, 9999);
    }

}

module.exports = YouTubeManager;