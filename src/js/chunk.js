import { Group, MeshNormalMaterial, MeshStandardMaterial, Mesh, PlaneGeometry } from 'three';
import { Body, Heightfield, Material } from 'cannon-es';
import { createNoise4D } from 'simplex-noise';
import alea from 'alea';

class Chunk extends Group {
    constructor(options) {
        // Inherit Group properties
        super();

        // Merge options
        var segments = 16;
        options = Object.assign({
            type: Body.STATIC,
            segments: segments,
            position: {
                x: -(segments / 2),
                y: -(segments / 2),
                z: -(segments / 2)
            }
        }, options);
        
        
        // Create mesh geometry
        var geometry = new PlaneGeometry(options.segments, options.segments, options.segments, options.segments);
        var material = new MeshNormalMaterial({ flatShading: true });
        //var material = new MeshStandardMaterial({ color: '#ff0000', flatShading: true });
        var plane = new Mesh(geometry, material);
        this.name = 'chunk';
        this.add(plane);

        // Set noise seed
        var prng = new alea('abc123'); // Change parameter to redefine seed 
        var noise = new createNoise4D(prng);
        var scaleNoise = 0.1;
        var scaleHeight = 2;

        // Add height to map from z-noise
        var matrix = [];
        var bufferItemSize = plane.geometry.attributes.position.itemSize;
        for (var x = 0; x < options.segments + 1; x++) {
            matrix.push([]);
            for (var y = 0; y < options.segments + 1; y++) {
                // noise(x, y, z, w)
                var index = bufferItemSize * (x * (options.segments + 1) + y); // Buffer Index
                var height = noise((x + options.position.x) * scaleNoise, (y + options.position.y) * scaleNoise, 0, 0);
                var z = height * scaleHeight; // Scale
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