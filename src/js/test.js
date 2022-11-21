import { Group, HemisphereLight } from 'three';
import { World, Vec3 } from 'cannon-es';
import { Cube } from './cube';
import { Plane } from './plane';

class Test extends Group {
    constructor() {
        super();
        this.world = new World({ gravity: new Vec3(0, 0, -9.82) });
        this.init();
    }

    init() {
        // Add light
        var hemisphere = new HemisphereLight('#ffffff', '#333333', 1);
        hemisphere.position.set(0, -2, 2);
        this.add(hemisphere);

        // Add cubes
        for (var i = 0; i < 100; i++) {
            var range = 5;
            var x = -range + Math.random() * (range - -range);
            var y = -range + Math.random() * (range - -range);
            var z = -range + Math.random() * (range - -range);
            var cube = new Cube({ scale: { x: 1, y: 1, z: 1 }});
            cube.setPosition(x, y, range + z);
            this.add(cube); // Add 3D object to scene
            this.world.addBody(cube.body); // Add 
        }

        // Add plane
        var plane = new Plane();
        plane.setPosition(0, 0, -2);
        this.add(plane);
        this.world.addBody(plane.body);
    }

    update(alpha, interval) {
        if (alpha) {

        }
        else {
            this.world.step(interval); // ex: 1 / 60 =  60fps (~16ms)
        }

        // Loop through all child objects
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];

            // Update 3D object to rigid body position
            if (child?.body?.type == 1) {
                child.update(alpha);
            }
        }
    }
}

export { Test };