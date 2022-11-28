import { Clock } from 'three';
import { Test } from './test.js';
import Stats from './stats.js';
import '../scss/app.scss';

class App {
    constructor() {
        this.clock = new Clock();
        this.stats = new Stats();
        this.physicsDeltaSum = 0;
        this.physicsTickRate = 10; // Calculations per second
        this.physicsInterval = 1 / this.physicsTickRate;
        this.renderDeltaSum = 0;
        this.renderTickRate = -1; // Ex: 24 = 24fps, -1 = unlimited
        this.renderInterval = 1 / this.renderTickRate;

        // Add test
        this.test = new Test();

        // Append stats to DOM
        document.body.appendChild(this.stats.dom);

        // Add update loop (threejs built-in alternative to requestAnimationFrame)
        this.update();
    }

    // Initialize application
    update() {
        this.stats.begin(); // Begin FPS counter
        
        // Update time factors
        var _this = this;
        var delta = this.clock.getDelta();
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

        // restart loop
        requestAnimationFrame(function() { _this.update(); });
    }

    updatePhysics(interval) {
        this.test.updatePhysics(interval); // Update without alpha value
    }

    updateRender(delta, alpha) {
        // Set delta to target renderInterval
        if (this.renderTickRate > 0) delta = this.renderInterval;

        // Refresh rendered data
        this.test.updateRender(delta, alpha);
        
        // End FPS counter
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
}
window.app = new App();