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
        
        // Add lights to group
        this.name = 'sun';
        this.add(this.hemisphere, this.direct, this.direct.target);
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

        this.direct.position.set(samples / 4, samples / 4, samples / 4);
        this.direct.target.position.set(0, 0, 0);
        this.hemisphere.position.set(samples / 4, samples / 4, samples / 4);
        
        // Add debug functionality
        this.debug = true;
        if (this.debug == true) {
            this.helper = new CameraHelper(this.direct.shadow.camera);
            this.add(this.helper);
        }
    };
}

export { Sun };