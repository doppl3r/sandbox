import { AnimationMixer, LoopOnce, LoopRepeat } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

class Models {
    constructor(manager) {
        this.cache = {};
        this.modelLoader = new GLTFLoader(manager);
    }

    load() {
        var _this = this;
        var json = require('../json/models.json');
        for (const [key, value] of Object.entries(json)) {
            this.modelLoader.load(value.url, function(gltf) {
                // Load model from gltf.scene Object3D (includes SkinnedMesh)
                var model = gltf.scene;
                model.name = key;
                model.animations = gltf.animations;
                model.userData = { ...value.userData };
                _this.applyUserData(model);
                _this.cache[key] = model;
            });
        }
    }

    clone(object) {
        // Optional - Get object from cache by name key
        if (typeof object == 'string') object = this.cache[object];

        // Utilize SkeletonUtils.js clone function
        var model = clone(object);
        model.animations = [...object.animations]; // Clone animations object
        model.traverse(function(node) { if (node.isMesh) { node.material = node.material.clone(); }}); // Clone material
        model.position.copy(object.position);

        // Add mixer animations
        this.applyUserData(model);

        // Return new model object
        return model;
    }

    applyUserData(model) {
        // Set object properties from userData
        if (model.userData.position) { model.position.set(model.userData.position.x, model.userData.position.y, model.userData.position.z); }
        if (model.userData.rotation) { model.rotation.set(model.userData.rotation.x, model.userData.rotation.y, model.userData.rotation.z); }
        if (model.userData.scale) { model.scale.set(model.userData.scale.x, model.userData.scale.y, model.userData.scale.z); }

        // Check if animations exist
        if (model.animations.length > 0) {
            // Initialize loop type
            var loopType = (model.userData?.animation?.loop == true) ? LoopRepeat : LoopOnce;
            model.traverse(function(obj) { obj.frustumCulled = false; }); // Disable offscreen clipping
            model.mixer = new AnimationMixer(model);
            model.clips = [];

            // Add all animations (for nested models)
            for (var i = 0; i < model.animations.length; i++) {
                model.clips.push(model.mixer.clipAction(model.animations[i]));
                model.clips[i].setLoop(loopType);
                model.clips[i].reset();
            }

            // Add basic functions
            model.animation = {
                play: function() { for (var i = 0; i < model.clips.length; i++) { model.clips[i].play(); }},
                reset: function() { for (var i = 0; i < model.clips.length; i++) { model.clips[i].reset(); }},
                update: function(delta = 1 / 60) { model.mixer.update(delta); }
            }

            // Start animation if looping
            if (loopType == LoopRepeat) model.animation.play();
        }
    }
}

export { Models };