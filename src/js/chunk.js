import { Group, MeshNormalMaterial, Mesh, PlaneGeometry} from 'three';
import { Body, Heightfield, Vec3 } from 'cannon-es';
import { createNoise4D } from 'simplex-noise';
import alea from 'alea';

class Chunk extends Group {
    constructor(options) {
        // Inherit Group properties
        super();

        // Merge options
        options = Object.assign({
            type: Body.STATIC,
            position: { x: 0, y: 0, z: 0 },
            segments: 16,
        }, options);
        
        // Create mesh geometry
        var geometry = new PlaneGeometry(options.segments - 1, options.segments - 1, options.segments - 1, options.segments - 1);
        var material = new MeshNormalMaterial({  });
        var plane = new Mesh(geometry, material);
        this.name = 'chunk';
        this.add(plane);

        // Set noise seed
        var prng = new alea('pizza'); // Change parameter to redefine seed 
        var noise = new createNoise4D(prng);
        var scaleNoise = 0.1;
        var scaleHeight = 5;

        // Add height to map from z-noise
        var matrix = [];
        var bufferItemSize = plane.geometry.attributes.position.itemSize;
        for (var x = 0; x < options.segments; x++) {
            matrix.push([]);
            for (var y = 0; y < options.segments; y++) {
                // noise(x, y, z, w)
                var index = bufferItemSize * (x * options.segments + y); // Buffer Index
                var height = noise((x + options.position.x) * scaleNoise, (y + options.position.y) * scaleNoise, 0, 0);
                var z = height * scaleHeight; // Scale
                plane.geometry.attributes.position.array[index] = x + options.position.x;
                plane.geometry.attributes.position.array[index + 1] = y + options.position.y;
                plane.geometry.attributes.position.array[index + 2] = z + options.position.z;
                matrix[x].push(z);
            }
        }

        // Initialize rigid body
        this.body = new Body({ type: options.type, shape: new Heightfield(matrix, { elementSize: 1 }) });
    }
}

export { Chunk };