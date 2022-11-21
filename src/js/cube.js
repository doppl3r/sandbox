import { BoxGeometry, Group, MeshStandardMaterial, Mesh } from 'three';
import { Body, Box, Vec3 } from 'cannon-es';

class Cube extends Group {
    constructor(options) {
        super();

        // Merge options
        options = Object.assign({
            mass: 1,
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        }, options);

        // Initialize default cube mesh
        var geometry = new BoxGeometry(options.scale.x, options.scale.y, options.scale.z);
        var material = new MeshStandardMaterial({ color: '#dc265a' });
        var mesh = new Mesh(geometry, material);
        this.add(mesh);

        // Construct body
        var size = new Vec3(options.scale.x / 2, options.scale.y / 2, options.scale.z / 2);
        var shape = new Box(size);
        this.body = new Body({ mass: options.mass, shape: shape });

        // Declare prev/next position and rotation for interpolation
        this.positionPrev = this.positionNext = this.position.clone();
        this.quaternionPrev = this.quaternionNext = this.quaternion.clone();
    }

    update(alpha, interval) {
        if (alpha) {
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
            // Update new target position
            this.positionPrev = this.position.clone();
            this.positionNext = this.body.position.clone();

            this.quaternionPrev = this.quaternion.clone();
            this.quaternionNext = this.body.quaternion.clone();
        }
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.body.position.set(x, y, z);
    }

    setRotation(x, y, z) {
        this.quaternion.set(x, y, z);
        this.body.quaternion.set(x, y, z);
    }
}

export { Cube };