import { BoxGeometry, Group, MeshNormalMaterial, Mesh } from 'three';
import { Body, Box, Vec3, Quaternion } from 'cannon-es';

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
        var material = new MeshNormalMaterial({  });
        var mesh = new Mesh(geometry, material);
        this.add(mesh);

        // Construct body
        var size = new Vec3(options.scale.x / 2, options.scale.y / 2, options.scale.z / 2);
        var shape = new Box(size);
        this.body = new Body({ mass: options.mass, shape: shape });

        // Enable interpolation
        this.interpolate = true;
    }

    update(alpha, debug) {
        if (alpha == 1) {
            // Update debugger
            debug?.update();
        }
        else {
            this.lerpPositions((this.interpolate == true) ? alpha : 1);
            this.slerpQuaternions((this.interpolate == true) ? alpha : 1);
        }
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.body.position.set(x, y, z);
        this.body.previousPosition.set(x, y, z);
    }

    setRotation(x, y, z, w) {
        this.quaternion.set(x, y, z, w);
        this.body.quaternion.set(x, y, z, w);
        this.body.previousQuaternion.set(x, y, z, w);
    }

    lerpPositions(alpha) {
        this.body.position._x = this.body.position.x;
        this.body.position._y = this.body.position.y;
        this.body.position._z = this.body.position.z;
        this.position.lerpVectors(this.body.previousPosition, this.body.position, alpha);
    }

    slerpQuaternions(alpha) {
        this.body.quaternion._x = this.body.quaternion.x;
        this.body.quaternion._y = this.body.quaternion.y;
        this.body.quaternion._z = this.body.quaternion.z;
        this.body.quaternion._w = this.body.quaternion.w;
        this.quaternion.slerpQuaternions(this.body.previousQuaternion, this.body.quaternion, alpha);
    }
}

export { Cube };