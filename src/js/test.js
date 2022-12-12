import { HemisphereLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { HTMLRenderer, HTMLObject } from './CSS2DRenderer';
import CannonDebugger from 'cannon-es-debugger';
import Stats from './stats.js';
import { World, Vec3 } from 'cannon-es';
import { Assets } from './assets';
import { Cube } from './cube';
import { Sphere } from './sphere';
import { Terrain } from './terrain';

class Test {
    constructor() {
        var _this = this;
        this.stats = new Stats();
        this.assets = new Assets();
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
        this.textRenderer = new HTMLRenderer();

        // Update camera options
        this.camera.position.set(20, -20, 20);
        this.camera.up = new Vector3(0, 0, 1);
        this.camera.lookAt(new Vector3(0, 0, 0));
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.resizeWindow();

        // Append renderer to canvas
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(this.textRenderer.domElement);
        document.body.appendChild(this.stats.dom);

        // Add event listeners
        window.addEventListener('resize', function(e) { _this.resizeWindow(e); });
        
        this.world = new World({ gravity: new Vec3(0, 0, -9.82) });
        //this.debugger = new CannonDebugger(this.scene, this.world, { color: '#00ff00', scale: 1 });
        this.init();
    }

    init() {
        // Add model
        var _this = this;
        this.assets.load(function() {
            // Load stuff. Ex:
            // var model = _this.assets.models.clone('guide');
            // _this.scene.add(model);

            // Add light
            var hemisphere = new HemisphereLight('#ffffff', '#555555', 1);
            hemisphere.position.set(0, -2, 2);
            _this.scene.add(hemisphere);
    
            // Add shapes
            for (var i = 0; i < 20; i++) {
                var range = 0;
                var x = -range + Math.random() * (range - -range);
                var y = -range + Math.random() * (range - -range);
                var z = -range + Math.random() * (range - -range);
                var object = new Cube({ scale: { x: 2, y: 2, z: 2 }});
                var text = new HTMLObject('<div class="object-label">' + i + '</div>');
                if (i % 2 == 0) object = new Sphere({ radius: 1 });
                object.setPosition(x, y, 10 + z);
                object.add(text);
                _this.scene.add(object); // Add 3D object to scene
                _this.world.addBody(object.body); // Add 
            }
    
            // Add Terrain
            var terrain = new Terrain({ world: _this.world, assets: _this.assets });
            _this.scene.add(terrain);
        });
    }

    updatePhysics(interval) {
        this.stats.begin(); // Begin FPS counter
        this.world.step(interval); // ex: 1 / 60 =  60fps (~16ms)
    }

    updateRender(delta, alpha) {
        // Loop through all child objects
        for (var i = 0; i < this.scene.children.length; i++) {
            var child = this.scene.children[i];

            // Update 3D object to rigid body position
            if (child?.body?.type == 1) {
                child.update(alpha, this.debugger);
            }

            // Update animations
            if (child.animation) {
                child.animation.update(delta);
            }
        }

        // Update orbit (required if camera position is translated)
        this.orbit.update();

        // Render new scene
        this.renderer.render(this.scene, this.camera);
        this.textRenderer.render(this.scene, this.camera);
        this.stats.end(); // End FPS counter
    }

    resizeWindow(e) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.textRenderer.setSize(width, height);
    }
}

export { Test };