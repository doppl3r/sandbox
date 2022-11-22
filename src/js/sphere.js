import { Group, MeshNormalMaterial, Mesh, SphereGeometry } from 'three';
import { Body, Sphere as SphereES } from 'cannon-es';

class Sphere extends Group {
    constructor(options) {
        super();

        // Merge options
        options = Object.assign({
            mass: 1,
            radius: 1,
            widthSegments: 32,
            heightSegments: 16,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        }, options);

        // Initialize default sphere mesh
        var geometry = new SphereGeometry(options.radius, options.widthSegments, options.heightSegments);
        var material = new MeshNormalMaterial({ flatShading: true });
        var mesh = new Mesh(geometry, material);
        this.add(mesh);

        // Construct body
        var shape = new SphereES(options.radius);
        this.body = new Body({ mass: options.mass, shape: shape });

        // Declare prev/next position and rotation for interpolation
        this.positionPrev = this.position.clone();
        this.positionNext = this.position.clone();
        this.quaternionPrev = this.quaternion.clone();
        this.quaternionNext = this.quaternion.clone();

        // Enable interpolation
        this.interpolate = true;
    }

    update(alpha, debug) {
        if (alpha == 1) {
            // Update new target position
            this.positionPrev = this.position.clone();
            this.positionNext = this.body.position.clone();
            this.quaternionPrev = this.quaternion.clone();
            this.quaternionNext = this.body.quaternion.clone();

            // Update debugger
            debug?.update();
        }
        else {
            if (this.interpolate == true) {
                // Interpolate position
                this.position.x = this.positionPrev.x + (this.positionNext.x - this.positionPrev.x) * alpha;
                this.position.y = this.positionPrev.y + (this.positionNext.y - this.positionPrev.y) * alpha;
                this.position.z = this.positionPrev.z + (this.positionNext.z - this.positionPrev.z) * alpha;

                // Interpolate quaternion (rotation)
                this.quaternion.x = this.quaternionPrev.x + (this.quaternionNext.x - this.quaternionPrev.x) * alpha;
                this.quaternion.y = this.quaternionPrev.y + (this.quaternionNext.y - this.quaternionPrev.y) * alpha;
                this.quaternion.z = this.quaternionPrev.z + (this.quaternionNext.z - this.quaternionPrev.z) * alpha;
                this.quaternion.w = this.quaternionPrev.w + (this.quaternionNext.w - this.quaternionPrev.w) * alpha;
            }
            else {
                this.position.x = this.positionNext.x;
                this.position.y = this.positionNext.y;
                this.position.z = this.positionNext.z;
    
                this.quaternion.x = this.quaternionNext.x;
                this.quaternion.y = this.quaternionNext.y;
                this.quaternion.z = this.quaternionNext.z;
                this.quaternion.w = this.quaternionNext.w;
            }
        }
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.positionPrev.set(x, y, z);
        this.positionNext.set(x, y, z);
        this.body.position.set(x, y, z);
    }

    setRotation(x, y, z) {
        this.quaternion.set(x, y, z);
        this.quaternionPrev.set(x, y, z);
        this.quaternionNext.set(x, y, z);
        this.body.quaternion.set(x, y, z);
    }
}

export { Sphere };