class App {
    constructor() {
        var _this = this;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.outputEncoding = THREE.sRGBEncoding; // Accurate colors
        this.canvas = this.renderer.domElement;
        this.clock = new THREE.Clock();
        this.delta = 0;
        this.tick = 15; // Calculations per second
        this.interval = 1 / this.tick;

        // Update camera options
        this.camera.position.set(0, -10, 0);
        this.camera.rotation.set(90 * Math.PI / 180, 0, 0); // Rotate up 90°

        // Add update loop
        this.renderer.setAnimationLoop(function(time) { _this.render(time); });
    }

    // Initialize application
    render(time) {
        this.delta += this.clock.getDelta();

        // Update engine on a less recurring interval (improves performance)
        if (this.delta > this.interval) {
            this.update(this.delta);
            this.delta = this.delta % this.interval;
        }

        // Update renderer
        this.renderer.render(this.scene, this.camera);
    }

    // Update physics
    update(delta) {
        //console.log(delta);
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