import { Audio as TAudio, AudioListener, AudioLoader } from 'three';

class Audio {
    constructor(manager) {
        this.cache = {};
        this.muted = false;
        this.audioListener = new AudioListener();
        this.audioLoader = new AudioLoader(manager);
        this.volume = 1;
        this.setMasterVolume(this.volume);
    }

    load() {
        var _this = this;
        var json = require('../json/audio.json');
        for (const [key, value] of Object.entries(json)) {
            this.audioLoader.load(value.url, function(buffer) {
                var sound = new TAudio(_this.audioListener);
                sound.name = key;
                sound.setBuffer(buffer);
                _this.cache[key] = sound;
            });
        }
    }

    play(name) {
        this.cache[name].play();
    }

    toggleVolume() {
        if (this.muted == true) {
            this.muted = false;
            this.setMasterVolume(this.volume); // Use previous volume
        }
        else {
            this.muted = true;
            this.volume = this.getMasterVolume(); // Update previous volume
            this.setMasterVolume(0);
        }
    }

    mute(mute) {
        this.muted = !mute; // Set state to opposite
        this.toggleVolume();
    }

    setMasterVolume(volume) {
        this.audioListener.setMasterVolume(volume || 1);
    }

    getMasterVolume() {
        return this.audioListener.getMasterVolume();
    }
}

export { Audio };