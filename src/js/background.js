import { Texture } from "three";

class Background {
    constructor() {

    }

    getLinearGradientMaterial() {
        
    }

    getLinearGradient(colors = ['#ffffff', '#000000'], width = 64, height = 64) {
        var canvas = document.createElement('canvas');
        canvas.height = width;
        canvas.width = height;

        // Ensure 2 colors exist
        if (colors.length < 2) colors[1] = colors[0];
        
        // Create canvas context and material
        var context = canvas.getContext('2d');
        var texture = new Texture(canvas);
        var gradient = context.createLinearGradient(0, 0, width, height);
        var rgbs = colors.map(function(color) { return { r: parseInt(color.slice(1, 3), 16), g: parseInt(color.slice(3, 5), 16), b: parseInt(color.slice(5, 7), 16) }});
        rgbs.forEach(function(rgb, index, arr) {
            var offset = index / (arr.length - 1);
            gradient.addColorStop(offset, 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')');
        });
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
        texture.needsUpdate = true;
        return texture;
    }
}

export { Background };