import { DirectionalLight, CameraHelper, Group, HemisphereLight, Vector3 } from 'three';

class Sun extends Group {
    constructor(options) {
        super();

        // Create directional light (shadow effect)
        this.direct = new DirectionalLight('#ffffff', 0.5);
        this.direct.castShadow = true;

        // Create hemisphere lighting (natural light)
        this.hemisphere = new HemisphereLight('#ffffff', '#000000', 0.5);

        // Update position
        this.updateSamples(512);
        this.setPosition({ x: 0, y: 0, z: 0 });
        this.setTime(15); // 12 = noon
        
        // Add lights to group
        this.name = 'sun';
        this.add(this.hemisphere, this.direct, this.direct.target);
    }

    updateSamples(samples) {
        this.direct.shadow.mapSize.width = samples * 4;
        this.direct.shadow.mapSize.height = samples * 4;
        this.direct.shadow.camera.left = -(samples / 4);
        this.direct.shadow.camera.right = (samples / 4);
        this.direct.shadow.camera.top = (samples / 4);
        this.direct.shadow.camera.bottom = -(samples / 4);
        this.direct.shadow.camera.far = samples / 2;
        this.direct.shadow.camera.near = 0.5;
        this.distance = samples / 4;
        
        // Add debug functionality
        this.debug = false;
        if (this.debug == true) {
            this.helper = new CameraHelper(this.direct.shadow.camera);
            this.add(this.helper);
        }
    }

    setPosition(position = { x: 0, y: 0, z: 0 }) {
        // Only update target position for directional light. Requires new time to update position
        this.direct.target.position.copy(position);
    }

    setTime(time = 12) {
        var hours = 24;
        var degrees = (360 * (time - 12) / hours) % 360;
        var radians = degrees * Math.PI / 180;
        
        // Reset positions to zero with sun distance
        this.direct.position.set(0, 0, this.distance);
        this.hemisphere.position.set(0, 0, this.distance);

        // Rotate from zero position
        this.direct.position.applyAxisAngle({ x: 0, y: 1, z: 0 }, radians);
        this.hemisphere.position.applyAxisAngle({ x: 0, y: 1, z: 0 }, radians);

        // Add target position to newly rotated position. Hemisphere translation is not needed
        this.direct.position.add(this.direct.target.position);

        var _this = this;
        setTimeout(function() {
            _this.setTime(time + 0.005);
        }, 1 / 60)
    }
}

export { Sun };