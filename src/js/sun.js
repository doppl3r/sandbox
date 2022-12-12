import { DirectionalLight, Group, HemisphereLight, Vector3 } from 'three';

class Sun extends Group {
    constructor(options) {
        super();

        
        // Merge options
        options = Object.assign({
            position: {
                x: 128,
                y: 128,
                z: 128
            }
        }, options);

        // Create hemisphere lighting (natural light)
        this.hemisphere = new HemisphereLight('#ffffff', '#000000', 0.5);

        // Create directional light (shadow effect)
        this.direct = new DirectionalLight('#ffffff', 0.5);
        this.direct.castShadow = true;
        this.direct.shadow.mapSize.width = 2048;
        this.direct.shadow.mapSize.height = 2048;
        this.direct.shadow.camera.left = -512;
        this.direct.shadow.camera.right = 512;
        this.direct.shadow.camera.top = 512;
        this.direct.shadow.camera.bottom = -512;
        this.direct.shadow.camera.near = 0.5;
        this.direct.shadow.camera.far = 512;
        
        // Add lights to group
        this.name = 'sun';
        this.updatePosition(options.position.x, options.position.y, options.position.z);
        this.add(this.hemisphere, this.direct);
    }

    updatePosition(x, y, z) {
        var position = new Vector3(x, y, z);
        this.hemisphere.position.copy(position);
        this.direct.position.copy(this.hemisphere.position);
    }
}

export { Sun };