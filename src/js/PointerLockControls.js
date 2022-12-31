// Modified from /three/examples/jsm/controls/PointerLockControls.js
import { Euler, EventDispatcher, Vector3 } from 'three';

const _euler = new Euler( 0, 0, 0, 'ZYX' );
const _vector = new Vector3();

class PointerLockControls extends EventDispatcher {
	constructor( camera, domElement ) {
		super();
		this.domElement = domElement;
		this.isLocked = false;
		this.camera = camera;
		this.pointerSpeed = 0.5;
		this.movementX = 0;
		this.movementY = 0;
		this.connect();
	}

	onMouseMove(event) {
		if ( this.isLocked === false ) return;
		this.xBefore = this.movementX;
		this.yBefore = this.movementY;
		this.movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		this.movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		_euler.setFromQuaternion( this.camera.quaternion );
		_euler.z -= this.movementX * 0.002 * this.pointerSpeed;
		_euler.x -= this.movementY * 0.002 * this.pointerSpeed;

		// Lock vertical rotation
		_euler.x = Math.max(0, Math.min(Math.PI, _euler.x));

		// Apply camera from Euler
		this.camera.quaternion.setFromEuler( _euler );
		this.dispatchEvent({ type: 'change' });
	}

	onPointerlockChange() {
		if ( this.domElement.ownerDocument.pointerLockElement === this.domElement ) {
			this.dispatchEvent({ type: 'lock' });
			this.isLocked = true;
		}
		else {
			this.dispatchEvent({ type: 'unlock' });
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

	dispose() {
		this.disconnect();
	};

	getObject() { // retaining this method for backward compatibility
		return camera;
	};

	getDirection() {
		const direction = new Vector3( 0, 0, - 1 );
		return function ( v ) {
			return v.copy( direction ).applyQuaternion( this.camera.quaternion );
		};
	};

	moveForward(distance) {
		_vector.setFromMatrixColumn( this.camera.matrix, 0 );
		_vector.crossVectors( this.camera.up, _vector );
		this.camera.position.addScaledVector( _vector, distance );
	};

	moveRight(distance) {
		_vector.setFromMatrixColumn( this.camera.matrix, 0 );
		this.camera.position.addScaledVector( _vector, distance );
	};

	lock() {
		this.domElement.requestPointerLock();
	};

	unlock() {
		this.domElement.ownerDocument.exitPointerLock();
	};
}

export { PointerLockControls };
