// Modified from /three/examples/jsm/controls/PointerLockControls.js
import { Euler, Quaternion, Vector3 } from 'three';
import { Body, Sphere, Material } from 'cannon-es';

class CameraControls {
	constructor(camera, domElement) {
		var _this = this;
		this.domElement = domElement;
		this.isLocked = false;
		this.camera = camera;
		this.pointerSpeed = 1;
		this.euler = new Euler(0, 0, 0, 'ZYX');
		this.velocity = new Vector3();
		this.quaternion = new Quaternion();
		this.move = { old: new Vector3(), new: new Vector3(), forward: false, right: false, backward: false, left: false, jump: false, speed: 10 };
		
		// Add physical body
		this.radius = 2;
		this.shape = new Sphere(this.radius);
		this.material = new Material({ friction: 1, restitution: 0 });
		this.body = new Body({
			allowSleep: true,
			angularDamping: 0.999,
			fixedRotation: true,
			linearDamping: 0.05,
			mass: 5,
			material: this.material,
			position: camera.position,
			shape: this.shape,
			sleepSpeedLimit: 1,
			sleepTimeLimit: 0.1
		});
		this.body.addEventListener('sleep', function(e) {
			var body = e.target;
			body.fixedRotation = true;
			body.updateMassProperties();
		});
		this.body.addEventListener('wakeup', function(e) {
			var body = e.target;
			body.fixedRotation = false;
			body.updateMassProperties();
		});
		this.body.velocity.clampScalar = this.velocity.clampScalar;

		// Connect mouse controls
		this.connect();
	}

	update(delta, alpha, debug) {
		// Update camera rotation if mouse is moving
		if (this.isLooking()) {
			// Update camera rotation
			this.euler.setFromQuaternion(this.camera.quaternion);
			this.euler.z -= this.move.new.x * 0.001 * this.pointerSpeed;
			this.euler.x -= this.move.new.y * 0.001 * this.pointerSpeed;
			
			// Lock vertical rotation
			this.euler.x = Math.max(0, Math.min(Math.PI, this.euler.x));
	
			// Apply camera from Euler
			this.camera.quaternion.setFromEuler(this.euler);
			this.move.new.set(0, 0, 0); // Reset movement delta
		}
		
		
		
		// Update camera position
		if (alpha == 1) {
			debug?.update(); // Update debugger

			// Convert velocity to world coordinates
			this.velocity.set(0, 0, 0);
			if (this.move.forward == true) this.velocity.y = (0.5 * delta * 1000);
			if (this.move.right == true) this.velocity.x = (0.5 * delta * 1000);
			if (this.move.backward == true) this.velocity.y = -(0.5 * delta * 1000);
			if (this.move.left == true) this.velocity.x = -(0.5 * delta * 1000);
			
			// Add new velocity to body
			this.euler.x = 0; // Normalize direction speed by looking downward
			this.quaternion.setFromEuler(this.euler);
			this.velocity.applyQuaternion(this.quaternion);
			if (this.isMoving()) this.body.applyImpulse({ x: this.velocity.x, y: this.velocity.y, z: 0 });

			// Clamp velocity to movement speed
			this.body.velocity.x = Math.max(-this.move.speed, Math.min(this.move.speed, this.body.velocity.x));
			this.body.velocity.y = Math.max(-this.move.speed, Math.min(this.move.speed, this.body.velocity.y));

            // Set object position to previous body to capture missing frame
            this.camera.position.copy(this.body.previousPosition);
		}
		else {
			// Smoothly interpolate using physics alpha
			this.body.position._x = this.body.position.x;
			this.body.position._y = this.body.position.y;
			this.body.position._z = this.body.position.z;
			this.camera.position.lerpVectors(this.body.previousPosition, this.body.position, alpha);
		}
	}

	onMouseMove(e) {
		// Cancel movement if element is not locked
		if (this.isLocked === false) return;

		// Copy from new coordinates if they do not equal zero
		if (this.isLooking()) this.move.old.copy(this.move.new);
		
		// Add mouse coordinates. This allows the update function to apply input
		this.move.new.add({ x: e.movementX, y: e.movementY });

		// Fix Chrome jumping when mouse exits window range (known bug): 0.35% of screen width/height seems to be the sweet spot
		if (Math.abs(e.movementX) > window.innerWidth / 3 || Math.abs(e.movementY) > window.innerHeight / 3) {
			this.move.new.copy(this.move.old);
		}
	}

	isLooking() {
		return this.move.new.equals({ x: 0, y: 0 }) == false;		
	}

	isMoving() {
		return this.move.forward == true || this.move.right == true || this.move.backward == true || this.move.left == true;
	}

	onKeyDown(e) {
		if (this.isLocked === false) return;
		switch(e.code) {
			case 'KeyW': case 'ArrowUp': this.move.forward = true; break
			case 'KeyD': case 'ArrowRight': this.move.right = true; break
			case 'KeyS': case 'ArrowDown': this.move.backward = true; break
			case 'KeyA': case 'ArrowLeft': this.move.left = true; break
			case 'Space': this.move.jump = true; break
		}
	}

	onKeyUp(e) {
		if (this.isLocked === false) return;
		switch(e.code) {
			case 'KeyW': case 'ArrowUp': this.move.forward = false; break
			case 'KeyD': case 'ArrowRight': this.move.right = false; break
			case 'KeyS': case 'ArrowDown': this.move.backward = false; break
			case 'KeyA': case 'ArrowLeft': this.move.left = false; break
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

	connect() {
		var _this = this;
		this.domElement.ownerDocument.addEventListener( 'mousemove', function(e) { _this.onMouseMove(e); });
		this.domElement.ownerDocument.addEventListener( 'pointerlockchange', function(e) { _this.onPointerlockChange(e); });
		this.domElement.ownerDocument.addEventListener( 'keyup', function(e) { _this.onKeyUp(e); });
		this.domElement.ownerDocument.addEventListener( 'keydown', function(e) { _this.onKeyDown(e); });
	};

	disconnect() {
		this.domElement.ownerDocument.removeEventListener( 'mousemove', function(e) { _this.onMouseMove(e); });
		this.domElement.ownerDocument.removeEventListener( 'pointerlockchange', function(e) { _this.onPointerlockChange(e); });
		this.domElement.ownerDocument.removeEventListener( 'keyup', function(e) { _this.onKeyUp(e); });
		this.domElement.ownerDocument.removeEventListener( 'keydown', function(e) { _this.onKeyDown(e); });
	};
}

export { CameraControls };
