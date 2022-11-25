import { LoadingManager } from 'three';
import { Audio } from './audio.js';
import { Models } from './models.js';

class Assets {
    constructor() {
        this.manager = new LoadingManager();
        this.audio = new Audio(this.manager);
        this.models = new Models(this.manager);
    }

    update(delta) {

    }

    load(callback = function() {}) {
        this.manager.onLoad = callback;
        this.manager.onProgress = this.loadProgress;
        this.audio.load();
        this.models.load();
    }

    loadProgress(urls, index, max) {
        var percent = Math.ceil((index / max) * 100);
        console.log(percent);
    }
}

export { Assets };