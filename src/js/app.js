import { Scene, PerspectiveCamera, WebGLRenderer, sRGBEncoding, Clock } from 'three';
import { World } from 'cannon-es';
import '../scss/app.scss';

class App {
    constructor() {
        var _this = this;
        this.scene = new Scene();
        this.world = new World();
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.outputEncoding = sRGBEncoding; // Accurate colors
        this.canvas = this.renderer.domElement;
        this.clock = new Clock();
        this.deltaSum = 0;
        this.tickRate = 2; // Calculations per second
        this.interval = 1 / this.tickRate;

        // Update camera options
        this.camera.position.set(0, -10, 0);
        this.camera.rotation.set(90 * Math.PI / 180, 0, 0); // Rotate up 90°
        this.resizeWindow();

        // Append to canvas
        document.body.appendChild(this.canvas);

        // Add update loop (threejs built-in alternative to requestAnimationFrame)
        this.renderer.setAnimationLoop(function() { _this.update(); });
    }

    // Initialize application
    update() {
        var delta = this.clock.getDelta();
        var alpha = this.deltaSum / this.interval; // Interpolation factor

        // Refresh renderer
        this.updateRender(delta, alpha);
        
        // Update engine on a lessor interval (improves performance)
        this.deltaSum += delta;
        if (this.deltaSum > this.interval) {
            this.updateEngine(this.deltaSum);
            this.deltaSum %= this.interval; // reset with remainder
        }
    }

    updateEngine(delta) {
        //console.log(delta);
    }

    updateRender(delta, alpha) {
        //console.log(delta, alpha);
        this.renderer.render(this.scene, this.camera);
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