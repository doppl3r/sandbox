import { BufferGeometry, CameraHelper, DirectionalLight, Float32BufferAttribute, Group, HemisphereLight, Points, PointsMaterial, Texture } from 'three';

class Sun extends Group {
    constructor(options) {
        super();

        // Merge options
        options = Object.assign({}, options);

        // Create directional light (shadow effect)
        var colors = ['#ffffff', '#ffffff'];
        this.direct = new DirectionalLight(colors, 0.5);
        this.direct.castShadow = true;

        // Create hemisphere lighting (natural light)
        this.hemisphere = new HemisphereLight(colors[0], '#000000', 0.5);

        // Update position
        this.time = 9; // 12 = noon
        this.speed = 0.25; // 1 rotation = 24 seconds
        this.updateSamples(512);
        this.updatePosition({ x: 0, y: 0, z: 0 });
        this.updateGraphic(colors, 128, 128);
        this.updateTime(this.time);
        
        // Add lights to group
        this.name = 'sun';
        this.add(this.hemisphere, this.direct, this.direct.target, this.graphic);
    }

    update(delta) {
        // Update time
        this.time += delta * this.speed;
        this.updateTime(this.time);
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

    updateGraphic(colors = ['#ffffff'], size = 128, resolution = 128) {
        // Add sun particle
        var texture = this.updateTexture(colors, resolution);
        var geometry = new BufferGeometry();
        var material = new PointsMaterial({ size: size, map: texture, transparent: true, sizeAttenuation: true });
        geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));
        this.graphic = new Points(geometry, material);
        this.graphic.frustumCulled = false;
    }

    updatePosition(position = { x: 0, y: 0, z: 0 }) {
        // Only update target position for directional light. Requires new time to update position
        this.direct.target.position.copy(position);
    }

    updateTime(time = 12) {
        var hours = 24;
        var degrees = (360 * (time - 12) / hours) % 360;
        var radians = degrees * Math.PI / 180;
        
        // Reset positions to zero with sun distance
        this.direct.position.set(0, 0, this.distance);
        this.hemisphere.position.set(0, 0, this.distance);
        this.graphic.position.set(0, 0, this.distance * 1.25);

        // Rotate from zero position
        this.direct.position.applyAxisAngle({ x: 0, y: 1, z: 0 }, radians);
        this.hemisphere.position.applyAxisAngle({ x: 0, y: 1, z: 0 }, radians);
        this.graphic.position.applyAxisAngle({ x: 0, y: 1, z: 0 }, radians);

        // Add target position to newly rotated position. Hemisphere translation is not needed
        this.direct.position.add(this.direct.target.position);
    }

    updateTexture(colors = ['#ffffff'], size) {
        var canvas = document.createElement('canvas');
        var padding = 1;
        canvas.height = size + (padding * 2);
        canvas.width = size + (padding * 2);
        if (colors.length < 2) colors[1] = colors[0];
        
        // Create canvas context and material
        var context = canvas.getContext('2d');
        var texture = new Texture(canvas);
        var center = (size / 2) + padding;
        var radGrad = context.createRadialGradient(center, center, size * 0.4, center, center, size * 0.5);
        var rgbs = colors.map(function(color) { return { r: parseInt(color.slice(1, 3), 16), g: parseInt(color.slice(3, 5), 16), b: parseInt(color.slice(5, 7), 16) }});
        rgbs.forEach(function(rgb, index, arr) {
            var alpha = index / (arr.length - 1);
            radGrad.addColorStop(alpha, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (1 - alpha) + ')');
        });
        context.fillStyle = radGrad;
        context.fillRect(0, 0, size + (padding * 2), size + (padding * 2));
        texture.needsUpdate = true;
        return texture;
    }

    hexToRgb(hex) {
        hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(m, r, g, b) { return '#' + r + r + g + g + b + b; });
        hex = hex.substring(1).match(/.{2}/g).map(function(x) { return parseInt(x, 16); });
        return hex;
    }

    rgbToHex(r, g, b) {
        var hex = [r, g, b];
        hex = hex.map(function(x) { var str = x.toString(16); return str.length === 1 ? '0' + str : str; });
        hex = '#' + hex.join('');
        return hex;
    }
}

export { Sun };