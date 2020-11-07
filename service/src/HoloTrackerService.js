const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;
const YouTubeManager = require('./YouTubeManager');

// read API key from storage and initialize YouTube
fs.readFile('key/youtube.key', 'utf-8', function error(err, key) {
    if (err) throw err;
    init(key);
})

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

