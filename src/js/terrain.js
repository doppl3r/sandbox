import { Group } from 'three';
import { Chunk } from './chunk';
import { Noise } from './noise';

class Terrain extends Group {
    constructor(options) {
        // Inherit Group properties
        super();

        // Merge options
        options = Object.assign({

        }, options);

        // Merge options
        var noise = new Noise({ seed: 'pizza', resolution: 0.1, height: 1 });
        var chunk = new Chunk({ segments: 64, noise: noise });
        this.add(chunk);
        if (options.world) options.world.addBody(chunk.body);
    }
}

export { Terrain };