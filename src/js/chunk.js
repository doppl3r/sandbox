import { Group, MeshStandardMaterial, Mesh, PlaneGeometry, RepeatWrapping } from 'three';
import { Body, Heightfield, Material } from 'cannon-es';

class Chunk extends Group {
    constructor(options) {
        // Inherit Group properties
        super();

        // Merge options
        options = Object.assign({
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            segments: 16,
            type: Body.STATIC
        }, options);
        
        // Create mesh geometry
        var geometry = new PlaneGeometry(options.segments, options.segments, options.segments, options.segments);
        var material = new MeshStandardMaterial({ flatShading: true });
        var plane = new Mesh(geometry, material);
        
        // Add optional texture
        if (options.texture) {
            material.map = options.texture;
            options.texture.repeat.set(options.segments, options.segments);
            options.texture.wrapS = RepeatWrapping;
            options.texture.wrapT = RepeatWrapping;
        }

        // Add plane mesh to chunk
        plane.castShadow = true;
        plane.receiveShadow = true;
        this.name = 'chunk';
        this.add(plane);

        // Add height to map from z-noise
        if (options.noise) {
            var matrix = [];
            var bufferItemSize = plane.geometry.attributes.position.itemSize;
            for (var x = 0; x < options.segments + 1; x++) {
                matrix.push([]);
                for (var y = 0; y < options.segments + 1; y++) {
                    // Update height map with or without noise
                    var index = bufferItemSize * (x * (options.segments + 1) + y); // Buffer Index
                    var z = this.getHeight(x, y, options);
                    plane.geometry.attributes.position.array[index] = x;
                    plane.geometry.attributes.position.array[index + 1] = y;
                    plane.geometry.attributes.position.array[index + 2] = z;
                    matrix[x].push(z);
                }
            }
        }

        this.position.copy(options.position); // translate chunk position
        plane.geometry.computeVertexNormals(); // Update normals

        // Initialize rigid body
        this.body = new Body({
            type: options.type,
            material: new Material({ friction: 0.05, restitution: 1 }),
            shape: new Heightfield(matrix, { elementSize: 1 })
        });
        this.body.position.copy(options.position);
    }

    getHeight(x, y, options) {
        var noise = options.noise;

        // Return 0 if no noise exists
        if (noise == null) return 0;

        // Wrap noise in array if not done already
        if (Array.isArray(noise) == false) noise = [noise];

        // Loop through noise arrays and add height
        var height = 0;
        for (var i = 0; i < noise.length; i++) {
            var n = noise[i];
            height += n((x + options.position.x) * n.resolution, (y + options.position.y) * n.resolution, 0, 0) * n.height;
        }
        return height;
    }
}

export { Chunk };