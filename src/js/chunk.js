import { BufferAttribute, Color, Group, MeshStandardMaterial, Mesh, PlaneGeometry, RepeatWrapping } from 'three';
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
        var material = new MeshStandardMaterial({ flatShading: true, vertexColors: true });
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
            var bufferItemSize = geometry.attributes.position.itemSize;
            var max = options.noise.reduce(function(a, b) { return Math.abs(a.height) + Math.abs(b.height); });
            var colors = ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'];
            var color_one = new Color();
            var color_two = new Color();
            var color_new = new Color();

            // Define empty color buffered attribute
            if (material.vertexColors) geometry.setAttribute('color', new BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3));

            for (var x = 0; x < options.segments + 1; x++) {
                matrix.push([]);
                for (var y = 0; y < options.segments + 1; y++) {
                    // Update height map with or without noise
                    var index = bufferItemSize * (x * (options.segments + 1) + y); // Buffer Index
                    var z = this.getHeight(x, y, options);
                    var alpha = (z + max) / (max * 2); // vertex color alpha

                    // Update vertex position
                    geometry.attributes.position.array[index] = x;
                    geometry.attributes.position.array[index + 1] = y;
                    geometry.attributes.position.array[index + 2] = z;
                    matrix[x].push(z);

                    if (material.vertexColors) {
                        // Define vertex color index and alpha value
                        color_one.index = Math.floor(alpha * (colors.length - 1));
                        color_two.index = Math.floor(alpha * (colors.length - 1)) + 1;
                        color_new.alpha = (alpha * (colors.length - 1)) % (colors.length - 1) % 1;

                        // Interpolate between colors
                        color_one.set(colors[color_one.index]);
                        color_two.set(colors[color_two.index]);
                        color_new.lerpColors(color_one, color_two, color_new.alpha);

                        // Define new vertex colors
                        geometry.attributes.color.array[index] = color_new.r;
                        geometry.attributes.color.array[index + 1] = color_new.g;
                        geometry.attributes.color.array[index + 2] = color_new.b;
                    }
                }
            }
        }

        // Copy chunk position and update normals
        this.position.copy(options.position);
        geometry.computeVertexNormals();

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