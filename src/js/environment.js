import { Group } from 'three';
import { World, Vec3 } from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

class Environment extends Group {
    constructor() {
        super();

        this.world = new World({
            allowSleep: true,
            gravity: { x: 0, y: 0, z: -9.82 }
        });
        //this.debugger = new CannonDebugger(this, this.world, { color: '#00ff00', scale: 1 });
    }

    init(assets) {
        var dungeon = assets.models.cache['world-dungeon'];
        dungeon.position.set(-82, -94, 33);
        this.add(dungeon);
    }

    update(delta) {

    }
}

export { Environment };