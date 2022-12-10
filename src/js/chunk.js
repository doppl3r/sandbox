import { Group, MeshNormalMaterial, MeshStandardMaterial, Mesh, PlaneGeometry } from 'three';
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
        var material = new MeshNormalMaterial({ flatShading: true });
        //var material = new MeshStandardMaterial({ color: '#ff0000', flatShading: true });
        var plane = new Mesh(geometry, material);
        this.name = 'chunk';
        this.add(plane);

        // Add height to map from z-noise
        var matrix = [];
        var bufferItemSize = plane.geometry.attributes.position.itemSize;
        for (var x = 0; x < options.segments + 1; x++) {
            matrix.push([]);
            for (var y = 0; y < options.segments + 1; y++) {
                // Update height map with or without noise
                var index = bufferItemSize * (x * (options.segments + 1) + y); // Buffer Index
                var height = (options.noise) ? options.noise((x + options.position.x) * options.noise.resolution, (y + options.position.y) * options.noise.resolution, 0, 0) * options.noise.height : 0;
                var z = height;
                plane.geometry.attributes.position.array[index] = x + options.position.x;
                plane.geometry.attributes.position.array[index + 1] = y + options.position.y;
                plane.geometry.attributes.position.array[index + 2] = z + options.position.z;
                matrix[x].push(z);
            }
        }
        plane.geometry.computeVertexNormals();

        // Initialize rigid body
        this.body = new Body({
            type: options.type,
            material: new Material({ friction: 0.05, restitution: 1 }),
            shape: new Heightfield(matrix, { elementSize: 1 })
        });
        this.body.position.copy(options.position);
    }
}

export { Chunk };