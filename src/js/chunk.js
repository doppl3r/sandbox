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
        var geometry = new PlaneGeometry(options.segments, options.segments);
        var material = new MeshNormalMaterial({  });
        var plane = new Mesh(geometry, material);
        this.name = 'chunk';
        this.add(plane);

        // Set noise seed
        var prng = new alea('pizza'); // Change parameter to redefine seed 
        var noise = new createNoise4D(prng);
        var scaleNoise = 0.1;
        var scaleHeight = 1;

        // Add height to map from z-noise
        var matrix = [];
        for (var x = 0; x < options.segments; x++) {
            matrix.push([]);
            for (var y = 0; y < options.segments; y++) {
                // noise(x, y, z, w)
                var height = noise((x + options.position.x) * scaleNoise, (y + options.position.y) * scaleNoise, 0, 0);
                matrix[x].push(height * scaleHeight);
            }
        }

        // Initialize rigid body
        this.body = new Body({ type: options.type, shape: new Heightfield(matrix, { elementSize: 1 }) });
    }
}

export { Chunk };