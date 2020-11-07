class Video {
    constructor(info) {
        this.title = info.title;
        this.description = info.description;
        this.views = info.views;
        this.thumbnail = info.thumbnail;
        this.id = info.id;
        this.duration = info.duration;
    }

    toString() {
        return "Video(title:" + this.title + ",id:" + this.id + ")";
    }
}

module.exports = Video;