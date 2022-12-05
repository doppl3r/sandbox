import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'

class HTMLRenderer extends CSS2DRenderer {
    constructor() {
        super();

        // Update DOM elements
        Object.assign(this.domElement, { className: 'html-renderer' });
        Object.assign(this.domElement.style, { position: 'absolute', left: 0, top: 0, pointerEvents: 'none' });
        this.setSize(window.innerWidth, window.innerHeight); // Default fullscreen
    }
}

class HTMLObject extends CSS2DObject {
    constructor(html) {
        // Wrap non-html with <div>
        html = (/<\/?[a-z][\s\S]*>/i.test(html)) ? html : '<div>' + html + '</div>';

        // Create element from HTML string
        var element = document.createElement('template');
        element.style.pointerEvents = 'all';
        element.innerHTML = html.trim();
        element = element.content.firstChild;
        Object.assign(element.style, { pointerEvents: 'all' });

        // Inherit CSS2DObject and use local element
        super(element);
        
        // Allow HTML to be removed when the parent is removed
        var _this = this;
        this.addEventListener('added', function(e) {
            _this.parent.addEventListener('removed', function(e) {
                _this.removeFromParent();
            });
        });
    }
}

export { HTMLRenderer, HTMLObject };