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
        options = Object.assign({ segments: 16 }, options);

        // Merge options
        var seed = 'pizza';
        this.noises = [
            new Noise({ seed: seed + 'ground', resolution: 0.1, height: 1 }),
            new Noise({ seed: seed + 'mountain', resolution: 0.01, height: 25 })
        ];
        this.segments = options.segments;
        if (options.world) this.world = options.world;
        
        // Add default chunks
        for (var x = -64; x < 64; x += this.segments) {
            for (var y = -64; y < 64; y += this.segments) {
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
            chunk = new Chunk({
                segments: this.segments,
                noise: this.noises,
                position: position
            });
            chunk.point = position.x + ',' + position.y + ',' + position.z;
            if (this.world) this.world.addBody(chunk.body);
            this.add(chunk);
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