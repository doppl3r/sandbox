// Modified from /three/examples/jsm/controls/PointerLockControls.js
import { Euler, EventDispatcher, Vector3 } from 'three';

const _euler = new Euler( 0, 0, 0, 'ZYX' );
const _vector = new Vector3();
var MAX_PI = Math.PI / 1.1;
var MIN_PI = 0;

class PointerLockControls extends EventDispatcher {
	constructor( camera, domElement ) {
		super();

		this.domElement = domElement;
		this.isLocked = false;
		
		this.pointerSpeed = 0.5;
		const scope = this;

		function onMouseMove( event ) {
			if ( scope.isLocked === false ) return;
			const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
			console.log(movementX, movementY);
			if (movementX > scope.range || movementX < -scope.range) { console.log('hey'); return };

			_euler.setFromQuaternion( camera.quaternion );
			_euler.z -= movementX * 0.002 * scope.pointerSpeed;
			_euler.x -= movementY * 0.002 * scope.pointerSpeed;

			// Lock vertical rotation
			_euler.x = Math.max(MIN_PI, Math.min(MAX_PI, _euler.x));

			// Apply camera from Euler
			camera.quaternion.setFromEuler( _euler );
			scope.dispatchEvent({ type: 'change' });
		}

		function onPointerlockChange() {
			if ( scope.domElement.ownerDocument.pointerLockElement === scope.domElement ) {
				scope.dispatchEvent({ type: 'lock' });
				scope.isLocked = true;
			}
			else {
				scope.dispatchEvent({ type: 'unlock' });
				scope.isLocked = false;
			}
		}

		function onPointerlockError() {
			console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );
		}

		this.connect = function () {
			scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove );
			scope.domElement.ownerDocument.addEventListener( 'pointerlockchange', onPointerlockChange );
			scope.domElement.ownerDocument.addEventListener( 'pointerlockerror', onPointerlockError );
		};

		this.disconnect = function () {
			scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove );
			scope.domElement.ownerDocument.removeEventListener( 'pointerlockchange', onPointerlockChange );
			scope.domElement.ownerDocument.removeEventListener( 'pointerlockerror', onPointerlockError );
		};

		this.dispose = function () {
			this.disconnect();
		};

		this.getObject = function () { // retaining this method for backward compatibility
			return camera;
		};

		this.getDirection = function () {
			const direction = new Vector3( 0, 0, - 1 );
			return function ( v ) {
				return v.copy( direction ).applyQuaternion( camera.quaternion );
			};
		}();

		this.moveForward = function ( distance ) {
			_vector.setFromMatrixColumn( camera.matrix, 0 );
			_vector.crossVectors( camera.up, _vector );
			camera.position.addScaledVector( _vector, distance );
		};

		this.moveRight = function ( distance ) {
			_vector.setFromMatrixColumn( camera.matrix, 0 );
			camera.position.addScaledVector( _vector, distance );
		};

		this.lock = function () {
			this.domElement.requestPointerLock();
		};

		this.unlock = function () {
			scope.domElement.ownerDocument.exitPointerLock();
		};

		this.connect();
	}
}

export { PointerLockControls };
