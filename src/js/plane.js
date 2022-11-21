import { DoubleSide, Group, MeshBasicMaterial, Mesh, PlaneGeometry } from 'three';
import { Body, Plane as PlaneES } from 'cannon-es';

class Plane extends Group {
    constructor(options) {
        super();

        // Merge options
        options = Object.assign({ mass: 1, scale: { x: 1, y: 1, z: 1 }}, options);
        options = Object.assign({
            type: Body.STATIC,
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        }, options);

        // Initialize default plane
        var geometry = new PlaneGeometry(5, 5);
        var material = new MeshBasicMaterial({ color: 0x620460, side: DoubleSide });
        var mesh = new Mesh(geometry, material);
        this.add(mesh);

        // Construct body
        this.body = new Body({ type: options.type, shape: new PlaneES() });

        // Declare prev/next position for interpolation
        this.positionPrev = this.positionNext = this.position.clone();
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.body.position.set(x, y, z);
    }

    setRotation(x, y, z) {
        this.rotation.set(x, y, z);
        this.body.quaternion.setFromEuler(x, y, z);
    }
}

export { Plane };