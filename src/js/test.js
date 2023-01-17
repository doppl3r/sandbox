import { Clock, PerspectiveCamera, PCFSoftShadowMap, Scene, Vector3, WebGLRenderer } from 'three';
import { Controls } from './controls';
import { Environment } from './environment';
import Stats from './stats.js';

import { Assets } from './assets';

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
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 4000);
        this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;

        // Update camera options
        this.camera.position.set(0, 0, 5);
        this.camera.up.set(0, 0, 1);
        this.camera.lookAt(new Vector3(0, 0, 0));
        this.controls = new Controls(this.camera, document.body);
        this.resizeWindow();

        // Append renderer to canvas
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(this.stats.dom);
        
        // Add event listeners
        document.addEventListener('visibilitychange', function(e) { _this.visibilityChange(); });
        document.addEventListener('click', function () { _this.controls.lock(); });
        window.addEventListener('resize', function(e) { _this.resizeWindow(e); });
        
        this.env = new Environment();
        
        // Load everything
        this.assets.load(function() {
            _this.init();
            _this.renderer.setAnimationLoop(function() { _this.update(); });
        });
        
    }

    init() {
        // Add environment
        this.env.init(this.assets);
        this.scene.add(this.env);

        // Add sword to camera
        var sword = this.assets.models.clone('sword');
        sword.scale.set(0.25, 0.25, 0.25);
        sword.position.set(0.15, -0.1, -0.25);
        sword.rotation.set(0, Math.PI * -0.35, Math.PI * -0.1);
        this.camera.add(sword);
        this.scene.add(this.camera);

        // Add pointer controls body to world
        this.env.world.addBody(this.controls.body);
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
        this.env.updatePhysics(interval);
    }

    updateRender(delta, alpha) {
        // Set delta to target renderInterval
        if (this.renderTickRate > 0) delta = this.renderInterval;

        // Update environment
        this.env.updateRender(delta, alpha);

        // Update controls
        this.controls.update(delta, alpha);

        // Render new scene
        this.renderer.render(this.scene, this.camera);
        this.stats.end(); // End FPS counter
    }

    resizeWindow(e) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
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