import { Group, MeshNormalMaterial, Mesh, SphereGeometry } from 'three';
import { Body, Sphere as SphereES, Material } from 'cannon-es';

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
        this.name = 'sphere';

        // Construct body
        var shape = new SphereES(options.radius);
        this.body = new Body({
            mass: options.mass,
            shape: shape,
            material: new Material({ friction: 0.1, restitution: 0.05 })
        });

        // Enable interpolation
        this.interpolate = true;
    }

    update(alpha, debug) {
        if (alpha == 1) {
            debug?.update(); // Update debugger

            // Set object position to previous body to capture missing frame
            this.position.copy(this.body.previousPosition);
            this.quaternion.copy(this.body.previousQuaternion);
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

export { Sphere };