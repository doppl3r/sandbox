// Modified from /three/examples/jsm/controls/PointerLockControls.js
import { Euler, Vector3, Raycaster } from 'three';
import { Body, Sphere, Material } from 'cannon-es';

class Controls {
	constructor(camera, domElement) {
		var _this = this;
		this.domElement = domElement;
		this.isLocked = false;
		this.camera = camera;
		this.pointerSpeed = 1;
		this.direction = new Euler(0, 0, 0, 'ZYX');
		this.raycaster = new Raycaster(new Vector3(0, 0, 0), new Vector3(0, 0, -1));
		this.velocity = new Vector3();
		this.keys = {}; // Keyboard input
		this.move = {
			old: new Vector3(),
			new: new Vector3(),
			speed: 10
		};
		
		// Add physical body
		this.radius = 2;
		this.shape = new Sphere(this.radius);
		this.material = new Material('wheel');
		this.body = new Body({
			allowSleep: true,
			angularDamping: 0.75,
			fixedRotation: false,
			linearDamping: 0.75,
			mass: 5,
			material: this.material,
			position: camera.position,
			shape: this.shape,
			sleepSpeedLimit: 0.5,
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

		// Connect mouse controls
		this.connect();
	}

	update(delta, alpha, debug) {
		// Update camera rotation if mouse is moving
		if (this.isLooking()) {
			// Update camera rotation
			this.direction.setFromQuaternion(this.camera.quaternion);
			this.direction.z -= this.move.new.x * 0.001 * this.pointerSpeed;
			this.direction.x -= this.move.new.y * 0.001 * this.pointerSpeed;
			
			// Lock vertical rotation
			this.direction.x = Math.max(0, Math.min(Math.PI, this.direction.x));
	
			// Apply camera from Euler
			this.camera.quaternion.setFromEuler(this.direction);
			this.move.new.set(0, 0, 0); // Reset movement delta
		}
		
		// Update camera position
		if (alpha == 1) {
			debug?.update(); // Update debugger

			// Convert velocity to world coordinates
			this.velocity.set(0, 0, 0);
			if (this.keys['KeyW'] == true) this.velocity.y = (0.5 * delta * 1000);
			if (this.keys['KeyD'] == true) this.velocity.x = (0.5 * delta * 1000);
			if (this.keys['KeyS'] == true) this.velocity.y = -(0.5 * delta * 1000);
			if (this.keys['KeyA'] == true) this.velocity.x = -(0.5 * delta * 1000);
			
			// Apply camera rotation to velocity vector
			this.direction.x = 0; // Normalize direction speed by looking downward
			this.velocity.applyEuler(this.direction);

			// Jump if on the ground
			if (this.keys['Space'] == true) {
				if (this.isGrounded()) {
					this.keys['Space'] = false;
					this.velocity.z = 50;
					//this.body.applyImpulse({ x: 0, y: 0, z:  });
				}
				else {
					this.keys['Space'] = false;
				}
			}

			// Apply velocity to body
			this.body.applyImpulse(this.velocity);

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
		return this.keys['KeyW'] == true || this.keys['KeyD'] == true || this.keys['KeyS'] == true || this.keys['KeyA'] == true;
	}

	isGrounded() {
		this.raycaster.ray.origin.copy(this.body.position);
		var objects = this.raycaster.intersectObjects(this.camera.parent.children);
		var grounded = false;
		for (var i = 0; i < objects.length; i++) {
			var contact = objects[i];
			var object = contact.object;
			var parent = object.parent;
			if (parent && parent.body) {
				if (contact.distance < this.radius * 1.25) {
					console.log(contact);
					grounded = true;
					break;
				}
			}
		}
		return grounded;
	}

	onKeyDown(e) {
		this.keys[e.code] = true;
	}

	onKeyUp(e) {
		this.keys[e.code] = false;
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

export { Controls };