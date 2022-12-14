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
        this.updateSamples(256);
        this.setTime(15); // 3pm
        
        // Add lights to group
        this.name = 'sun';
        this.add(this.hemisphere, this.direct, this.direct.target);
    }

    setTime(time) {
        var hours = 24;
        var degrees = (360 * (time - 12) / hours) % 360;
        var radians = degrees * Math.PI / 180;
        this.direct.position.copy(this.direct.positionOrigin);
        this.direct.position.applyAxisAngle({ x: 0, y: 1, z: 0 }, radians);
        this.hemisphere.position.copy(this.direct.positionOrigin);
        this.hemisphere.position.applyAxisAngle({ x: 0, y: 1, z: 0 }, radians);
    }

    updateSamples(samples) {
        this.direct.shadow.mapSize.width = samples * 4;
        this.direct.shadow.mapSize.height = samples * 4;
        this.direct.shadow.camera.left = -(samples / 2);
        this.direct.shadow.camera.right = (samples / 2);
        this.direct.shadow.camera.top = (samples / 2);
        this.direct.shadow.camera.bottom = -(samples / 2);
        this.direct.shadow.camera.far = samples;
        this.direct.shadow.camera.near = 0.5;

        this.direct.position.set(0, 0, samples / 2);
        this.direct.positionOrigin = this.direct.position.clone();
        this.direct.target.position.set(0, 0, 0);
        this.hemisphere.position.set(0, 0, samples / 2);

        
        
        // Add debug functionality
        this.debug = true;
        if (this.debug == true) {
            this.helper = new CameraHelper(this.direct.shadow.camera);
            this.add(this.helper);
        }
    }
}

export { Sun };