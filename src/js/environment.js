import { Box3, Group, TwoPassDoubleSide, Vector3 } from 'three';
import { Body, Box, Material, World } from 'cannon-es';
import { Cube } from './cube';
import { Sphere } from './sphere';
import { Terrain } from './terrain';
import { Sun } from './sun';
import { Background } from './background';
import CannonDebugger from 'cannon-es-debugger';

class Environment extends Group {
    constructor() {
        super();

        // Create sunlight light
        this.sun = new Sun();

        // Create background
        this.background = new Background();

        // Add physical world
        this.world = new World({
            allowSleep: true,
            gravity: { x: 0, y: 0, z: -9.82 }
        });

        // Optional debugger
        //this.debugger = new CannonDebugger(this, this.world, { color: '#00ff00', scale: 1 });
    }

    init(assets) {
        // Add dungeon
        this.dungeon = assets.models.clone('world-dungeon');
        this.calculateBodies(this.dungeon);
        this.add(this.dungeon);
    }

    calculateBodies(object) {
        // Loop through objects
        for (var i = 0; i < object.children.length; i++) {
            var obj = object.children[i];

            // Add non-Group Mesh to Group
            if (obj.type == 'Mesh') {
                obj = {
                    type: 'Group',
                    children: [obj],
                    position: obj.position,
                    quaternion: obj.quaternion,
                    userData: obj.userData
                };
            }

            // Only apply bodies to 
            if (obj.type == 'Group') {
                // Loop through meshes
                var scale = new Vector3();
                var box = new Box3();
                for (var j = 0; j < obj.children.length; j++) {
                    var mesh = obj.children[j].clone();
                    if (mesh.geometry) {
                        if (mesh.material.name == 'hidden') {
                            mesh.material.opacity = 0;
                            mesh.material.transparent = true;
                        }
                        mesh.quaternion.set(0, 0, 0, 0);
                        box.setFromObject(mesh);
                        scale.copy(box.max.sub(box.min)).divideScalar(2);
                    }
                }

                // Add body to world
                object.children[i].body = new Body({
                    mass: obj.userData.mass || 0,
                    material: new Material({ friction: 0.1, restitution: 0 }),
                    position: obj.position,
                    quaternion: obj.quaternion,
                    shape: new Box(scale)
                });

                this.world.addBody(object.children[i].body);
            }
        }
        this.debugger?.update();
    }

    calculateBody(obj) {
        console.log(obj);
    }

    updatePhysics(interval) {
        this.world.step(interval); // ex: 1 / 60 =  60fps (~16ms)
        this.debugger?.update();
    }

    updateRender(delta, alpha) {
        // Update sun orbit
        this.sun.update(delta);

        // Loop through all child objects
        for (var i = 0; i < this.dungeon.children.length; i++) {
            var child = this.dungeon.children[i];

            // Update 3D object to rigid body position
            if (child?.body?.type == 1) {
                this.updateObject(child, alpha);
            }
        }
    }

    updateObject(object, alpha) {
        if (alpha == 1) {
            // Set object position to previous body to capture missing frame
            object.position.copy(object.body.previousPosition);
            object.quaternion.copy(object.body.previousQuaternion);
        }
        else {
            object.body.position._x = object.body.position.x;
            object.body.position._y = object.body.position.y;
            object.body.position._z = object.body.position.z;
            object.body.quaternion._x = object.body.quaternion.x;
            object.body.quaternion._y = object.body.quaternion.y;
            object.body.quaternion._z = object.body.quaternion.z;
            object.body.quaternion._w = object.body.quaternion.w;
            object.position.lerpVectors(object.body.previousPosition, object.body.position, alpha);
            object.quaternion.slerpQuaternions(object.body.previousQuaternion, object.body.quaternion, alpha);
        }
    }
}

export { Environment };