import { Group } from 'three';
import { World, Vec3 } from 'cannon-es';

class Environment extends Group {
    constructor() {
        super();

        this.world = new World({
            allowSleep: true,
            gravity: { x: 0, y: 0, z: -9.82}
        });
    }
}

export { Environment };