import { Clock, PerspectiveCamera, PCFSoftShadowMap, Scene, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from './PointerLockControls';
import { HTMLRenderer, HTMLObject } from './CSS2DRenderer';
import CannonDebugger from 'cannon-es-debugger';
import Stats from './stats.js';
import { World, Vec3 } from 'cannon-es';
import { Sun } from './sun';
import { Assets } from './assets';
import { Cube } from './cube';
import { Sphere } from './sphere';
import { Terrain } from './terrain';
import { Background } from './background';

class Test {
    constructor() {
        var _this = this;
        this.clock = new Clock();
        this.clock.scale = 1;
        this.physicsDeltaSum = 0;
        this.physicsTickRate = 30; // Calculations per second
        this.physicsInterval = 1 / this.physicsTickRate;
        this.renderDeltaSum = 0;
        this.renderTickRate = -1; // Ex: 24 = 24fps, -1 = unlimited
        this.renderInterval = 1 / this.renderTickRate;
        this.stats = new Stats();
        this.assets = new Assets();
        this.scene = new Scene();
        this.background = new Background();
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
        this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        this.textRenderer = new HTMLRenderer();

        // Update camera options
        this.camera.position.set(-80, -80, 80);
        this.camera.up = new Vector3(0, 0, 1);
        this.camera.lookAt(new Vector3(0, 0, 0));
        //this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls = new PointerLockControls(this.camera, document.body);
        this.resizeWindow();

        // Add light
        this.sun = new Sun();

        // Append renderer to canvas
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(this.textRenderer.domElement);
        document.body.appendChild(this.stats.dom);
        
        // Add event listeners
        document.addEventListener('visibilitychange', function(e) { _this.visibilityChange(); });
        document.addEventListener('click', function () { _this.controls.lock(); });
        window.addEventListener('resize', function(e) { _this.resizeWindow(e); });
        
        this.world = new World({ gravity: new Vec3(0, 0, -9.82) });
        //this.debugger = new CannonDebugger(this.scene, this.world, { color: '#00ff00', scale: 1 });
        this.init();

        // Add update loop (threejs built-in alternative to requestAnimationFrame)
        this.renderer.setAnimationLoop(function() { _this.update(); });
    }

    init() {
        // Add model
        var _this = this;
        this.assets.load(function() {
            // Add light to scene
            _this.scene.add(_this.sun);

            // Add pointer controls body to world
            _this.world.addBody(_this.controls.body);
    
            // Add shapes
            for (var i = 0; i < 100; i++) {
                var range = 0;
                var scale = 4;
                var x = -range + Math.random() * (range - -range);
                var y = -range + Math.random() * (range - -range);
                var z = -range + Math.random() * (range - -range);
                var object = new Cube({ scale: { x: scale, y: scale, z: scale }});
                var text = new HTMLObject('<div class="object-label">' + i + '</div>');
                if (i % 2 == 0) object = new Sphere({ radius: scale / 2 });
                object.setPosition(x, y, 10 + z);
                //object.add(text);
                _this.scene.add(object); // Add 3D object to scene
                _this.world.addBody(object.body); // Add 
            }
    
            // Add Terrain
            _this.terrain = new Terrain({ world: _this.world, assets: _this.assets });
            _this.scene.add(_this.terrain);
        });
    }

    update() {
        // Update time factors
        var delta = this.clock.getDelta() * this.clock.scale;
        var alpha = this.physicsDeltaSum / this.physicsInterval; // Interpolation factor
        
        // Update engine on a lessor interval (improves performance)
        this.physicsDeltaSum += delta;
        if (this.physicsDeltaSum > this.physicsInterval) {
            this.physicsDeltaSum %= this.physicsInterval; // reset with remainder
            this.updatePhysics(this.physicsInterval);
            alpha = 1; // Request new position from physics
        }

        // Refresh renderer on a higher (or unlimited) interval
        this.renderDeltaSum += delta;
        if (this.renderDeltaSum > this.renderInterval || this.renderTickRate < 0) {
            this.renderDeltaSum %= this.renderInterval;
            this.updateRender(delta, alpha);
        }
    }

    updatePhysics(interval) {
        this.stats.begin(); // Begin FPS counter
        this.world.step(interval); // ex: 1 / 60 =  60fps (~16ms)
    }

    updateRender(delta, alpha) {
        // Set delta to target renderInterval
        if (this.renderTickRate > 0) delta = this.renderInterval;

        // Loop through all child objects
        for (var i = 0; i < this.scene.children.length; i++) {
            var child = this.scene.children[i];

            // Update 3D object to rigid body position
            if (child?.body?.type == 1) {
                child.update(delta, alpha, this.debugger);
            }

            // Update animations
            if (child.animation) {
                child.animation.update(delta);
            }
        }

        // Update sun orbit
        this.sun.update(delta);

        // Update controls
        this.controls.update(delta, alpha);

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

    pause(play = false) {
        this.play = play;
        this.clock.stop();
        this.clock.elapsedTimePaused = this.clock.getElapsedTime();
    }

    resume(play = true) {
        this.play = play;
        this.clock.start();
        this.clock.elapsedTime = this.clock.elapsedTimePaused || 0;
    }

    visibilityChange() {
        if (document.visibilityState == 'visible') this.resume(this.play);
        else this.pause(this.play);
    }
}

export { Test };