import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class Models {
    constructor(manager) {
        this.modelLoader = new GLTFLoader(manager);
    }

    load() {
        this.json = require('../json/models.json');
    }

    update(delta) {

    }
}

export { Models };