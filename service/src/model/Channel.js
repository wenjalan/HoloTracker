// represents a YouTube channel, either a Talent's or a Translator's
class Channel {
    constructor(info) {
        this.title = info.title;
        this.id = info.id;
        this.subcount = info.subcount;
        this.uploadsPlaylistId = info.uploadsPlaylistId;
    }

    toString() {
        return this.title + "(id:" + this.id + ")";
    }
}

module.exports = Channel;