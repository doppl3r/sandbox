import { Group } from 'three';
import { Chunk } from './chunk';
import { Noise } from './noise';

class Terrain extends Group {
    constructor(options) {
        // Inherit Group properties
        super();

        // Set defaults
        this.name = 'terrain';

        // Merge options
        options = Object.assign({ segments: 32 }, options);

        // Merge options
        var seed = 'doppler';
        this.noises = [
            new Noise({ seed: seed + 'ground', resolution: 0.1, height: 3 }),
            new Noise({ seed: seed + 'mountain', resolution: 0.0085, height: 50 })
        ];
        this.segments = options.segments;
        if (options.world) this.world = options.world;
        if (options.assets) this.assets = options.assets;
        
        // Add default chunks
        var rows = 4;
        var cols = 4;
        for (var x = -options.segments * cols; x < options.segments * cols; x += this.segments) {
            for (var y = -options.segments * rows; y < options.segments * rows; y += this.segments) {
                this.addChunk({ x: x, y: y, z: 0 });
            }
        }
    }

    addChunk(position) {
        // Snap position to segments
        this.snapPosition(position);
        
        // Add chunk if it does not exist
        var chunk = this.getChunk(position);
        if (chunk == null) {
            // Define new chunk
            chunk = new Chunk({
                segments: this.segments,
                noise: this.noises,
                position: position
            });

            // Assign new property
            chunk.point = position.x + ',' + position.y + ',' + position.z;

            // Add object and physical body
            this.add(chunk);
            if (this.world) this.world.addBody(chunk.body);
        }
    }
    
    getChunk(position) {
        this.snapPosition(position);
        var point = position.x + ',' + position.y + ',' + position.z;
        var child = this.getObjectByProperty('point', point);
        return child;
    }

    removeChunk(position) {
        this.snapPosition(position);
        var chunk = this.getChunk(position);
        if (chunk) {
            chunk.removeFromParent();
            if (chunk.body) this.world.removeBody(chunk.body);
        }
    }

    removeChunks() {
        var length = this.children.length;
        for (var i = length - 1; i >= 0; i--) {
            var chunk = this.children[i];
            chunk.removeFromParent();
            this.world.removeBody(chunk.body);
		}
    }

    snapPosition(position) {
        position.x = Math.floor(position.x / this.segments) * this.segments;
        position.y = Math.floor(position.y / this.segments) * this.segments;
        position.z = Math.floor(position.z / this.segments) * this.segments;
    }
}

export { Terrain };