import { createNoise2D, createNoise3D, createNoise4D } from 'simplex-noise';
import alea from 'alea';

class Noise {
    constructor(options) {
        options = Object.assign({
            height: 1,
            resolution: 1,
            seed: new Date,
            type: '4D',
        }, options);

        // Change parameter to redefine seed 
        var prng = new alea(options.seed);
        var noise = function(type) {
            switch (type) {
                case '2D': return new createNoise2D(prng);
                case '3D': return new createNoise3D(prng);
                case '4D': return new createNoise4D(prng);
            }
        }(options.type); // Generate noise
        noise.height = options.height;
        noise.resolution = options.resolution;
        return noise;
    }
}

export { Noise };