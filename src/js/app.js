import { Scene, PerspectiveCamera, WebGLRenderer, Clock, Vector3 } from 'three';
import { Test } from './test.js';
import Stats from './stats.js';
import '../scss/app.scss';

class App {
    constructor() {
        var _this = this;
        this.stats = new Stats();
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
        this.canvas = this.renderer.domElement;
        this.clock = new Clock();
        this.deltaSum = 0;
        this.tickRate = 10; // Calculations per second
        this.interval = 1 / this.tickRate;

        // Update camera options
        this.camera.position.set(10, -10, 10);
        this.camera.up = new Vector3(0, 0, 1);
        this.camera.lookAt(new Vector3(0, 0, -3));
        this.resizeWindow();

        // Append to canvas
        document.body.appendChild(this.canvas);
        document.body.appendChild(this.stats.dom);

        // Add test
        this.test = new Test();
        this.scene.add(this.test); // Add 3D object to scene

        // Add update loop (threejs built-in alternative to requestAnimationFrame)
        this.renderer.setAnimationLoop(function() { _this.update(); });
    }

    // Initialize application
    update() {
        // Begin FPS counter
        this.stats.begin();

        // Update time factors
        var delta = this.clock.getDelta();
        var alpha = this.deltaSum / this.interval; // Interpolation factor
        
        // Update engine on a lessor interval (improves performance)
        this.deltaSum += delta;
        if (this.deltaSum > this.interval) {
            this.deltaSum %= this.interval; // reset with remainder
            this.updatePhysics(this.interval);
            alpha = 1; // Request new position from physics
        }

        // Refresh renderer
        this.updateRender(alpha, this.interval);
    }

    updatePhysics(interval) {
        this.test.updatePhysics(interval); // Update without alpha value
    }

    updateRender(alpha) {
        this.test.updateRender(alpha);
        this.renderer.render(this.scene, this.camera);
        this.stats.end(); // End FPS counter
    }

    pause(play = false) {
        this.play = play;
        this.clock.stop();
    }

    resume(play = true) {
        this.play = play;
        this.clock.start();
    }

    resizeWindow(e) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
window.app = new App();

// Add event listeners
window.addEventListener('resize', function(e) { app.resizeWindow(e); });