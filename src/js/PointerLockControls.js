// Modified from /three/examples/jsm/controls/PointerLockControls.js
import { Euler, EventDispatcher, Vector2 } from 'three';

class PointerLockControls extends EventDispatcher {
	constructor( camera, domElement ) {
		super();
		this.domElement = domElement;
		this.isLocked = false;
		this.camera = camera;
		this.pointerSpeed = 1;
		this.euler = new Euler(0, 0, 0, 'ZYX');
		this.movementNew = new Vector2();
		this.movementOld = new Vector2();
		this.connect();
	}

	onMouseMove(e) {
		if ( this.isLocked === false ) return;
		this.movementOld.copy(this.movementNew);
		this.movementNew.add({ x: e.movementX, y: e.movementY });

		// Fix Chrome jumping when mouse exits window range (known bug)
		if (Math.abs(e.movementX) > window.innerWidth / 3 || Math.abs(e.movementY) > window.innerHeight / 3) {
			this.movementNew.copy(this.movementOld);
		}
	}

	update(delta) {
		// Update camera rotation
		this.euler.setFromQuaternion( this.camera.quaternion );
		this.euler.z -= this.movementNew.x * 0.001 * this.pointerSpeed;
		this.euler.x -= this.movementNew.y * 0.001 * this.pointerSpeed;
		
		// Lock vertical rotation
		this.euler.x = Math.max(0, Math.min(Math.PI, this.euler.x));

		// Apply camera from Euler
		this.camera.quaternion.setFromEuler(this.euler);
		this.movementNew.set(0, 0); // Reset pointer
	}

	lock() {
		this.domElement.requestPointerLock();
	};
	
	unlock() {
		this.domElement.ownerDocument.exitPointerLock();
	};

	onPointerlockChange() {
		if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
			this.isLocked = true;
		}
		else {
			this.isLocked = false;
		}
	}

	onPointerlockError() {
		console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );
	}

	connect() {
		var _this = this;
		this.domElement.ownerDocument.addEventListener( 'mousemove', function(e) { _this.onMouseMove(e); });
		this.domElement.ownerDocument.addEventListener( 'pointerlockchange', function(e) { _this.onPointerlockChange(e); });
		this.domElement.ownerDocument.addEventListener( 'pointerlockerror', function(e) { _this.onPointerlockError(e); });
	};

	disconnect() {
		this.domElement.ownerDocument.removeEventListener( 'mousemove', function(e) { _this.onMouseMove(e); });
		this.domElement.ownerDocument.removeEventListener( 'pointerlockchange', function(e) { _this.onPointerlockChange(e); });
		this.domElement.ownerDocument.removeEventListener( 'pointerlockerror', function(e) { _this.onPointerlockError(e); });
	};
}

export { PointerLockControls };
