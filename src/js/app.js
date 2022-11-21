import { Scene, PerspectiveCamera, WebGLRenderer, sRGBEncoding, Clock } from 'three';
import { Test } from './test.js';
import Stats from './stats.js';
import '../scss/app.scss';

class App {
    constructor() {
        var _this = this;
        this.stats = new Stats();
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.outputEncoding = sRGBEncoding; // Accurate colors
        this.canvas = this.renderer.domElement;
        this.clock = new Clock();
        this.deltaSum = 0;
        this.tickRate = 30; // Calculations per second
        this.interval = 1 / this.tickRate;

        // Update camera options
        this.camera.position.set(0, -10, 0);
        this.camera.rotation.set(90 * Math.PI / 180, 0, 0); // Rotate up 90°
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
        this.stats.begin();

        var delta = this.clock.getDelta();
        var alpha = this.deltaSum / this.interval; // Interpolation factor
        
        // Update engine on a lessor interval (improves performance)
        this.deltaSum += delta;
        if (this.deltaSum > this.interval) {
            this.test.update(null, this.interval); // Update without alpha value
            this.deltaSum %= this.interval; // reset with remainder
            return false;
        }

        // Refresh renderer
        this.test.update(alpha, this.interval);
        this.refresh();

        this.stats.end();
    }

    pause(play = false) {
        this.play = play;
        this.clock.stop();
    }

    resume(play = true) {
        this.play = play;
        this.clock.start();
    }

    refresh() {
        this.renderer.render(this.scene, this.camera);
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