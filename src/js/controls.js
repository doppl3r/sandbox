// Modified from /three/examples/jsm/controls/PointerLockControls.js
import { Euler, Vector3, Raycaster } from 'three';
import { Body, Sphere, Material } from 'cannon-es';

class Controls {
	constructor(camera, domElement) {
		this.domElement = domElement;
		this.isLocked = false;
		this.camera = camera;
		this.direction = new Euler(0, 0, 0, 'ZYX');
		this.raycaster = new Raycaster(new Vector3(0, 0, 0), new Vector3(0, 0, -1), 0, 10);
		this.velocity = new Vector3();
		this.keys = {}; // Keyboard input
		this.mouse = { old: new Vector3(), new: new Vector3() };
		this.speed = { delta: 0, look: 1, move: { acceleration: 1, max: 5 } };
		
		// Add physical body
		this.radius = 2;
		this.shape = new Sphere(this.radius);
		this.material = new Material('wheel');
		this.body = new Body({
			allowSleep: true,
			fixedRotation: false,
			linearDamping: 0,
			mass: 10,
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
			this.direction.z -= this.mouse.new.x * 0.001 * this.speed.look;
			this.direction.x -= this.mouse.new.y * 0.001 * this.speed.look;
			
			// Lock vertical rotation
			this.direction.x = Math.max(0, Math.min(Math.PI, this.direction.x));
	
			// Apply camera from Euler
			this.camera.quaternion.setFromEuler(this.direction);
			this.mouse.new.set(0, 0, 0); // Reset movement delta
		}
		
		// Update camera position
		if (alpha == 1) {
			debug?.update(); // Update debugger

			// Convert velocity to world coordinates
			this.velocity.set(0, 0, 0);
			this.speed.delta = (delta * 1000 * this.speed.move.acceleration);
			if (this.keys['KeyW'] == true) this.velocity.y = this.speed.delta;
			if (this.keys['KeyD'] == true) this.velocity.x = this.speed.delta;
			if (this.keys['KeyS'] == true) this.velocity.y = -this.speed.delta;
			if (this.keys['KeyA'] == true) this.velocity.x = -this.speed.delta;
			
			// Apply camera rotation to velocity vector
			this.direction.x = 0; // Normalize direction speed by looking downward
			this.velocity.applyEuler(this.direction);

			// Jump if on the ground
			if (this.keys['Space'] == true) {
				if (this.isGrounded()) {
					this.keys['Space'] = false;
					this.body.applyImpulse({ x: 0, y: 0, z: 5 * this.body.mass });
				}
				else {
					this.keys['Space'] = false;
				}
			}

			// Apply directional velocity to body
			if (this.isMoving()) {
				this.body.angularDamping = 0.75;
				this.body.applyImpulse(this.velocity);
			}
			else {
				this.body.angularDamping = 1; // Grip walls
			}

			// Clamp body velocity speed
			if (this.body.velocity.length() > this.speed.move.max) {
				this.velocity.copy(this.body.velocity);
				this.velocity.clampLength(-this.speed.move.max, this.speed.move.max);
				this.body.velocity.x = this.velocity.x;
				this.body.velocity.y = this.velocity.y;
			}

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
		if (this.isLooking()) this.mouse.old.copy(this.mouse.new);
		
		// Add mouse coordinates. This allows the update function to apply input
		this.mouse.new.add({ x: e.movementX, y: e.movementY });

		// Fix Chrome jumping when mouse exits window range (known bug): 0.35% of screen width/height seems to be the sweet spot
		if (Math.abs(e.movementX) > window.innerWidth / 3 || Math.abs(e.movementY) > window.innerHeight / 3) {
			this.mouse.new.copy(this.mouse.old);
		}
	}

	isLooking() {
		return this.mouse.new.equals({ x: 0, y: 0 }) == false;		
	}

	isMoving() {
		return this.keys['KeyW'] == true || this.keys['KeyD'] == true || this.keys['KeyS'] == true || this.keys['KeyA'] == true;
	}

	isGrounded() {
		var grounded = false;

		// Check scene
		if (this.camera.parent) {
			this.raycaster.ray.origin.copy(this.body.position);
			var contact = this.raycaster.intersectObjects(this.camera.parent.children)[0];
			
			if (contact) {
				var face = contact.face;
				var normal = face.normal;
				var object = contact.object;
				var parent = object.parent;
				var angle = normal.angleTo(this.velocity);

				
				// Must have a physical body
				if (parent && parent.body) {
					// Must be close to the contact point
					if (contact.distance < this.radius * 1.25) {
						grounded = true;
					}
				}
			}
		}
		return grounded;
	}

	onKeyDown(e) {
		if (e.repeat) return;
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
