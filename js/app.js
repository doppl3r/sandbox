class App {
    constructor() {
        var _this = this;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.outputEncoding = THREE.sRGBEncoding; // Accurate colors
        this.canvas = this.renderer.domElement;
        this.clock = new THREE.Clock();
        this.deltaSum = 0;
        this.tickRate = 2; // Calculations per second
        this.interval = 1 / this.tickRate;

        // Update camera options
        this.camera.position.set(0, -10, 0);
        this.camera.rotation.set(90 * Math.PI / 180, 0, 0); // Rotate up 90°

        // Add update loop (threejs built-in alternative to requestAnimationFrame)
        this.renderer.setAnimationLoop(function() { _this.render(); });
    }

    // Initialize application
    render() {
        var delta = this.clock.getDelta()
        this.deltaSum += delta;

        // Update engine on a lessor interval (improves performance)
        if (this.deltaSum > this.interval) {
            this.updatePhysics(delta);
            this.deltaSum = this.deltaSum % this.interval;
        }
        
        // Refresh renderer
        this.updateRender(delta);
        this.renderer.render(this.scene, this.camera);
    }

    updatePhysics(delta) {
        
    }

    updateRender(delta) {
        
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
var app = new App();

// Add event listeners
window.addEventListener('resize', function(e) { app.resizeWindow(e); });