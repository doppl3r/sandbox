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
		this.move = { old: new Vector2(), new: new Vector2() };
		this.connect();
	}

	onMouseMove(e) {
		// Cancel movement if element is not locked
		if (this.isLocked === false) return;

		// Copy from new coordinates if they do not equal zero
		if (this.isMoving()) this.move.old.copy(this.move.new);
		
		// Add mouse coordinates. This allows the update function to apply input
		this.move.new.add({ x: e.movementX, y: e.movementY });

		// Fix Chrome jumping when mouse exits window range (known bug): 0.35% of screen width/height seems to be the sweet spot
		if (Math.abs(e.movementX) > window.innerWidth / 3 || Math.abs(e.movementY) > window.innerHeight / 3) {
			this.move.new.copy(this.move.old);
		}
	}

	isMoving() {
		return this.move.new.equals({ x: 0, y: 0 }) == false;		
	}

	update(delta) {
		// Update camera if mouse is moving
		if (this.isMoving()) {
			// Update camera rotation
			this.euler.setFromQuaternion( this.camera.quaternion );
			this.euler.z -= this.move.new.x * 0.001 * this.pointerSpeed;
			this.euler.x -= this.move.new.y * 0.001 * this.pointerSpeed;
			
			// Lock vertical rotation
			this.euler.x = Math.max(0, Math.min(Math.PI, this.euler.x));
	
			// Apply camera from Euler
			this.camera.quaternion.setFromEuler(this.euler);
			this.move.new.set(0, 0); // Reset movement delta
		}
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
