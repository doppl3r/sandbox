import { Group, HemisphereLight } from 'three';
import CannonDebugger from 'cannon-es-debugger';
import { World, Vec3 } from 'cannon-es';
import { Assets } from './assets';
import { Cube } from './cube';
import { Sphere } from './sphere';
import { Plane } from './plane';

class Test extends Group {
    constructor() {
        super();
        this.assets = new Assets();
        this.world = new World({ gravity: new Vec3(0, 0, -9.82) });
        this.debugger = new CannonDebugger(this, this.world, { color: '#00ff00', scale: 1 });
        this.init();
    }

    init() {
        // Add model
        var _this = this;
        this.assets.load(function() {
            var model = _this.assets.models.clone('guide');
            _this.add(model);
        });

        // Add light
        var hemisphere = new HemisphereLight('#ffffff', '#555555', 1);
        hemisphere.position.set(0, -2, 2);
        this.add(hemisphere);

        // Add cubes
        for (var i = 0; i < 20; i++) {
            var range = 0;
            var x = -range + Math.random() * (range - -range);
            var y = -range + Math.random() * (range - -range);
            var z = -range + Math.random() * (range - -range);
            var object = new Cube({ scale: { x: 2, y: 2, z: 2 }});
            if (i % 2 == 0) object = new Sphere({ radius: 1 });
            object.setPosition(x, y, 10 + z);
            this.add(object); // Add 3D object to scene
            this.world.addBody(object.body); // Add 
        }

        // Add plane
        var plane = new Plane();
        plane.setPosition(0, 0, -2);
        plane.setRotation(0, 0.75, 0.75);
        this.add(plane);
        this.world.addBody(plane.body);
    }

    updatePhysics(interval) {
        this.world.step(interval); // ex: 1 / 60 =  60fps (~16ms)
    }

    updateRender(delta, alpha) {
        // Loop through all child objects
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];

            // Update 3D object to rigid body position
            if (child?.body?.type == 1) {
                child.update(alpha, this.debugger);
            }

            // Update animations
            if (child.animation) {
                child.animation.update(delta);
            }
        }
    }
}

export { Test };