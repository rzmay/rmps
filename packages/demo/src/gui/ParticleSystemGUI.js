import GUI from 'lil-gui';
import * as THREE from 'three';

// Replace this module specifier with the actual npm package name.
import {
    Emitter,
    EmissionShape,
    EmissionSource,
    NoiseModule,
    VelocityOverLifetime,
    ForceOverLifetime,
    LimitVelocityOverLifetime,
    TransformByNoise,
    ColorOverLifetime,
    ColorBySpeed,
    SizeOverLifetime,
    SizeBySpeed,
    RotationOverLifetime,
    RotationBySpeed,
    ExternalForces,
    SpriteRenderer,
    MeshRenderer,
    LightRenderer,
    TrailRenderer,
    TrailMode,
    TrailTextureMode,
} from '../../../rmps/build';

const INITIAL_VALUE_DEFAULTS = {
    lifetime: () => 1,
    speed: () => 1,
    position: () => new THREE.Vector3(),
    rotation: () => new THREE.Vector3(),
    scale: () => new THREE.Vector3(1, 1, 1),
    velocity: () => new THREE.Vector3(),
    angularVelocity: () => new THREE.Vector3(),
    scalarVelocity: () => new THREE.Vector3(),
    acceleration: () => new THREE.Vector3(),
    angularAcceleration: () => new THREE.Vector3(),
    scalarAcceleration: () => new THREE.Vector3(),
    color: () => new THREE.Color(1, 1, 1),
    alpha: () => 1,
    radial: () => 0,
};
const DEFAULT_MODULE_FACTORIES = {
    'Velocity Over Lifetime': () => new VelocityOverLifetime({ linear: new THREE.Vector3() }),
    'Force Over Lifetime': () => new ForceOverLifetime({ force: new THREE.Vector3() }),
    'Limit Velocity Over Lifetime': () => new LimitVelocityOverLifetime({ limit: new THREE.Vector3(10, 10, 10) }),
    'Transform By Noise': () => new TransformByNoise({ strength: new THREE.Vector3(1, 1, 1), frequency: 1 }),
    'Color Over Lifetime': () => new ColorOverLifetime({ color: new THREE.Color(1, 1, 1), alpha: 1 }),
    'Color By Speed': () => new ColorBySpeed({ color: new THREE.Color(1, 1, 1), speedRange: [0, 10] }),
    'Size Over Lifetime': () => new SizeOverLifetime({ size: new THREE.Vector3(1, 1, 1) }),
    'Size By Speed': () => new SizeBySpeed({ size: new THREE.Vector3(1, 1, 1), speedRange: [0, 10] }),
    'Rotation Over Lifetime': () => new RotationOverLifetime({ angularVelocity: new THREE.Vector3() }),
    'Rotation By Speed': () => new RotationBySpeed({ angularVelocity: new THREE.Vector3(), speedRange: [0, 10] }),
    'Noise Module': () => new NoiseModule('noise'),
    // ExternalForces needs project-owned force fields, so it starts empty.
    'External Forces': () => new ExternalForces({ forceFields: [], multiplier: 1 }),
};
const DEFAULT_RENDERER_FACTORIES = {
    Sprite: () => new SpriteRenderer(),
    Mesh: () => new MeshRenderer(),
    Light: () => new LightRenderer(),
    Trail: () => new TrailRenderer(),
};
export class ParticleSystemGUI {
    constructor(options) {
        this.presetLoadVersion = 0;
        this.sceneLoadVersion = 0;
        this.system = options.system;
        this.scene = options.scene;
        this.presets = options.presets ?? {};
        this.scenes = options.scenes ?? {};
        this.moduleFactories = { ...DEFAULT_MODULE_FACTORIES, ...options.moduleFactories };
        this.rendererFactories = { ...DEFAULT_RENDERER_FACTORIES, ...options.rendererFactories };
        this.onSystemChange = options.onSystemChange;
        this.onCodeChange = options.onCodeChange;
        this.currentPresetName = options.initialPreset;
        this.currentSceneName = options.initialScene;
        this.gui = new GUI({
            title: options.title ?? 'Particle System',
            width: options.width ?? 360,
            container: options.container,
        });
        this.injectStyles();
        this.gui.onChange(() => this.emitCode());
        this.rebuild();
        if (this.currentSceneName)
            void this.setScene(this.currentSceneName);
        this.emitCode();
    }
    get particleSystem() {
        return this.system;
    }
    setSystem(next, presetName) {
        if (next === this.system)
            return;
        this.currentPresetName = presetName;
        const previous = this.system;
        if (this.scene && previous.parent === this.scene) {
            this.scene.remove(previous);
            this.scene.add(next);
        }
        this.system = next;
        this.onSystemChange?.(next, previous);
        this.rebuild();
        this.emitCode();
    }
    refresh() {
        this.rebuild();
        this.emitCode();
    }
    generateCode() {
        return this.serializeParticleSystem();
    }
    destroy() {
        this.sceneCleanup?.();
        this.gui.destroy();
    }
    rebuild() {
        this.contentFolder?.destroy();
        this.contentFolder = this.gui.addFolder('Editor');
        this.contentFolder.open();
        this.buildDemoSelectors(this.contentFolder);
        this.buildSystemFolder(this.contentFolder);
        this.buildEmittersFolder(this.contentFolder);
        this.buildModulesFolder(this.contentFolder);
        this.buildRenderersFolder(this.contentFolder);
    }
    buildDemoSelectors(root) {
        if (Object.keys(this.presets).length === 0 && Object.keys(this.scenes).length === 0)
            return;
        const folder = root.addFolder('Demo');
        folder.domElement.classList.add('psgui-section', 'psgui-demo');
        const presetNames = Object.keys(this.presets);
        if (presetNames.length > 0) {
            const state = { preset: this.currentPresetName ?? '(current)' };
            folder.add(state, 'preset', ['(current)', ...presetNames]).name('Preset').onChange(async (name) => {
                if (name === '(current)')
                    return;
                const version = ++this.presetLoadVersion;
                const next = await this.presets[name]();
                if (version !== this.presetLoadVersion)
                    return;
                this.setSystem(next, name);
            });
        }
        const sceneNames = Object.keys(this.scenes);
        if (sceneNames.length > 0 && this.scene) {
            const state = { scene: this.currentSceneName ?? '(current)' };
            folder.add(state, 'scene', ['(current)', ...sceneNames]).name('Scene').onChange((name) => {
                if (name !== '(current)')
                    void this.setScene(name);
            });
        }
    }
    async setScene(name) {
        if (!this.scene || !this.scenes[name])
            return;
        const version = ++this.sceneLoadVersion;
        this.sceneCleanup?.();
        this.sceneCleanup = undefined;
        this.currentSceneName = name;
        const cleanup = await this.scenes[name](this.scene);
        if (version !== this.sceneLoadVersion) {
            if (typeof cleanup === 'function')
                cleanup();
            return;
        }
        if (typeof cleanup === 'function')
            this.sceneCleanup = cleanup;
    }
    buildSystemFolder(root) {
        const folder = root.addFolder('System');
        folder.domElement.classList.add('psgui-system');
        this.addVector3(folder, this.system.gravity, 'Gravity');
        this.addDynamicValue(folder, this.system, 'gravityModifier', 'Gravity Modifier');
        const actions = {
            clearParticles: () => {
                this.system.particles.length = 0;
            },
        };
        folder.add(actions, 'clearParticles').name('Clear Particles');
    }
    buildEmittersFolder(root) {
        const section = root.addFolder(`Emitters (${this.system.emitters.length})`);
        section.domElement.classList.add('psgui-section', 'psgui-emitters');
        section.open();
        this.system.emitters.forEach((emitter, index) => {
            const folder = section.addFolder(`${index + 1}. ${emitter.constructor.name}`);
            this.buildEmitter(folder, emitter, index);
        });
        const actions = {
            addEmitter: () => {
                this.system.emitters.push(new Emitter());
                this.rebuild();
                this.emitCode();
            },
        };
        section.add(actions, 'addEmitter').name('+ Add Emitter');
    }
    buildEmitter(folder, emitter, index) {
        this.addDynamicValue(folder, emitter, 'rate', 'Rate');
        folder.add(emitter, 'duration', 0.01).name('Duration');
        folder.add(emitter, 'looping').name('Looping');
        this.buildEmissionShape(folder.addFolder('Emission Shape'), emitter);
        this.buildInitialValues(folder.addFolder('Initial Values'), emitter);
        this.buildBursts(folder.addFolder(`Bursts (${emitter.bursts.length})`), emitter);
        const actions = {
            remove: () => {
                this.system.emitters.splice(index, 1);
                this.rebuild();
                this.emitCode();
            },
        };
        folder.add(actions, 'remove').name('Remove Emitter');
    }
    buildEmissionShape(folder, emitter) {
        const geometry = emitter.source.geometry;
        const params = geometry.parameters ?? {};
        const shape = this.geometryShapeName(geometry);
        const state = {
            shape,
            source: emitter.source.source,
            width: params.width ?? 1,
            height: params.height ?? 1,
            depth: params.depth ?? 1,
            radius: params.radius ?? 1,
            radialSegments: params.radialSegments ?? 16,
            heightSegments: params.heightSegments ?? 8,
            tube: params.tube ?? 0.4,
            tubularSegments: params.tubularSegments ?? 32,
            arc: params.arc ?? Math.PI * 2,
        };
        folder.add(state, 'shape', ['Box', 'Sphere', 'Cone', 'Torus']).name('Shape').onChange(() => {
            this.replaceEmitterShape(emitter, state);
            this.rebuild();
        });
        folder.add(state, 'source', {
            Volume: EmissionSource.Volume,
            Surface: EmissionSource.Surface,
            Vertices: EmissionSource.Vertices,
        }).name('Source').onChange((value) => {
            emitter.source.source = Number(value);
        });
        const rebuildShape = () => this.replaceEmitterShape(emitter, state);
        if (shape === 'Box') {
            folder.add(state, 'width', 0.01).onChange(rebuildShape);
            folder.add(state, 'height', 0.01).onChange(rebuildShape);
            folder.add(state, 'depth', 0.01).onChange(rebuildShape);
        }
        else if (shape === 'Sphere') {
            folder.add(state, 'radius', 0.01).onChange(rebuildShape);
            folder.add(state, 'radialSegments', 3, 64, 1).onFinishChange(rebuildShape);
            folder.add(state, 'heightSegments', 2, 64, 1).onFinishChange(rebuildShape);
        }
        else if (shape === 'Cone') {
            folder.add(state, 'radius', 0.01).onChange(rebuildShape);
            folder.add(state, 'height', 0.01).onChange(rebuildShape);
            folder.add(state, 'radialSegments', 3, 64, 1).onFinishChange(rebuildShape);
        }
        else if (shape === 'Torus') {
            folder.add(state, 'radius', 0.01).onChange(rebuildShape);
            folder.add(state, 'tube', 0.001).onChange(rebuildShape);
            folder.add(state, 'radialSegments', 3, 64, 1).onFinishChange(rebuildShape);
            folder.add(state, 'tubularSegments', 3, 128, 1).onFinishChange(rebuildShape);
            folder.add(state, 'arc', 0, Math.PI * 2).onChange(rebuildShape);
        }
    }
    replaceEmitterShape(emitter, state) {
        const source = Number(state.source);
        let shape;
        switch (state.shape) {
            case 'Box':
                shape = EmissionShape.Box(Number(state.width), Number(state.height), Number(state.depth));
                break;
            case 'Cone':
                shape = EmissionShape.Cone(Number(state.radius), Number(state.height), Number(state.radialSegments));
                break;
            case 'Torus':
                shape = EmissionShape.Torus(Number(state.radius), Number(state.tube), Number(state.radialSegments), Number(state.tubularSegments), Number(state.arc));
                break;
            default:
                shape = EmissionShape.Sphere(Number(state.radius), Number(state.radialSegments), Number(state.heightSegments));
                break;
        }
        shape.source = source;
        emitter.source = shape;
    }
    buildInitialValues(folder, emitter) {
        const initial = emitter.initialValues;
        Object.keys(initial).forEach((key) => {
            this.addDynamicValue(folder, initial, key, this.prettyName(key));
        });
        const missing = Object.keys(INITIAL_VALUE_DEFAULTS).filter((key) => !(key in initial));
        if (missing.length > 0) {
            const state = { parameter: missing[0] };
            folder.add(state, 'parameter', missing).name('New Parameter');
            const actions = {
                add: () => {
                    initial[state.parameter] = INITIAL_VALUE_DEFAULTS[state.parameter]();
                    this.rebuild();
                    this.emitCode();
                },
            };
            folder.add(actions, 'add').name('+ Add Parameter');
        }
    }
    buildBursts(folder, emitter) {
        emitter.bursts.forEach((burst, index) => {
            const item = folder.addFolder(`Burst ${index + 1}`);
            item.add(burst, 'time', 0, 1).name('Time');
            item.add(burst, 'count').min(0).step(1).name('Count');
            const actions = {
                remove: () => {
                    emitter.bursts.splice(index, 1);
                    this.rebuild();
                    this.emitCode();
                },
            };
            item.add(actions, 'remove').name('Remove');
        });
        const actions = {
            add: () => {
                emitter.bursts.push({ time: 0, count: 10 });
                this.rebuild();
                this.emitCode();
            },
        };
        folder.add(actions, 'add').name('+ Add Burst');
    }
    buildModulesFolder(root) {
        const section = root.addFolder(`Modules (${this.system.modules.length})`);
        section.domElement.classList.add('psgui-section', 'psgui-modules');
        section.open();
        this.system.modules.forEach((module, index) => {
            const folder = section.addFolder(`${index + 1}. ${module.constructor.name}`);
            this.buildModule(folder, module, index);
        });
        const names = Object.keys(this.moduleFactories);
        const state = { type: names[0] };
        section.add(state, 'type', names).name('Module Type');
        const actions = {
            add: () => {
                this.system.modules.push(this.moduleFactories[state.type]());
                this.rebuild();
                this.emitCode();
            },
        };
        section.add(actions, 'add').name('+ Add Module');
    }
    buildModule(folder, module, index) {
        const candidate = module;
        if (candidate.options && typeof candidate.options === 'object') {
            this.addObject(folder, candidate.options);
        }
        else {
            const hidden = new Set(['modify', 'noiseGenerator']);
            Object.keys(candidate)
                .filter((key) => !key.startsWith('_') && !hidden.has(key))
                .forEach((key) => this.addValue(folder, candidate, key, this.prettyName(key)));
        }
        const actions = {
            remove: () => {
                this.system.modules.splice(index, 1);
                this.rebuild();
                this.emitCode();
            },
        };
        folder.add(actions, 'remove').name('Remove Module');
    }
    buildRenderersFolder(root) {
        const section = root.addFolder(`Renderers (${this.system.renderers.length})`);
        section.domElement.classList.add('psgui-section', 'psgui-renderers');
        section.open();
        this.system.renderers.forEach((renderer, index) => {
            const folder = section.addFolder(`${index + 1}. ${renderer.constructor.name}`);
            this.buildRenderer(folder, renderer, index);
        });
        const names = Object.keys(this.rendererFactories);
        const state = { type: names[0] };
        section.add(state, 'type', names).name('Renderer Type');
        const actions = {
            add: () => {
                const renderer = this.rendererFactories[state.type]();
                renderer.setup(this.system);
                this.system.renderers.push(renderer);
                this.rebuild();
                this.emitCode();
            },
        };
        section.add(actions, 'add').name('+ Add Renderer');
    }
    buildRenderer(folder, renderer, index) {
        if (renderer instanceof SpriteRenderer) {
            this.buildSpriteRenderer(folder, renderer);
        } else if (renderer instanceof LightRenderer) {
            this.buildLightRenderer(folder, renderer);
        } else if (renderer instanceof MeshRenderer) {
            this.buildMeshRenderer(folder, renderer);
        } else if (renderer instanceof TrailRenderer) {
            this.buildTrailRenderer(folder, renderer);
        } else {
            this.addObject(folder, renderer, new Set([
                'setup',
                'update',
                'destroy',
                'mesh',
                'geometry',
                'material',
            ]));
        }

        const actions = {
            remove: () => {
                renderer.destroy();
                this.system.renderers.splice(index, 1);
                this.rebuild();
                this.emitCode();
            },
        };
        folder.add(actions, 'remove').name('Remove Renderer');
    }
    buildSpriteRenderer(folder, renderer) {
        this.addDynamicValue(folder, renderer, 'fps', 'FPS');
        folder.add(renderer, 'frames').min(1).step(1).name('Frames').onFinishChange(() => this.reloadSpriteMaterial(renderer));
        const materialState = { material: renderer.materialType };
        folder.add(materialState, 'material', ['unlit', 'basic']).name('Material').onChange((value) => {
            renderer.materialType = value;
            this.reloadSpriteMaterial(renderer);
        });
        this.addVector2(folder.addFolder('Grid Size'), renderer.gridSize, 'Grid', () => this.reloadSpriteMaterial(renderer));
        this.addVector2(folder.addFolder('Tile Size'), renderer.tileSize, 'Tile');
        this.addVector2(folder.addFolder('Tile Margin'), renderer.tileMargin, 'Margin');
        const info = {
            texture: renderer.texture?.name || renderer.texture?.uuid || '(texture)',
            alphaMap: renderer.alphaMap?.name || renderer.alphaMap?.uuid || '(none)',
        };
        folder.add(info, 'texture').name('Texture').disable();
        folder.add(info, 'alphaMap').name('Alpha Map').disable();
    }
    buildLightRenderer(folder, renderer) {
        this.addDynamicValue(folder, renderer, 'brightness', 'Brightness');
        this.addDynamicValue(folder, renderer, 'rangeMultiplier', 'Range Multiplier');
        folder.add(renderer, 'groupingRadiusRatio', 0).name('Grouping Radius');
        folder.add(renderer, 'decay', 0).name('Decay');
        folder.add(renderer, 'count').min(0).step(1).name('Max Lights');
        folder.add(renderer, 'ratio', 0, 1).name('Particle Ratio');
        folder.add(renderer, 'randomDistribution').name('Random Distribution');
        folder.add(renderer, 'useParticleColor').name('Use Particle Color');
        folder.add(renderer, 'sizeAffectsRange').name('Size Affects Range');
        folder.add(renderer, 'alphaAffectsIntensity').name('Alpha Affects Intensity');
        const lightOptions = folder.addFolder('Point Light');
        const lightState = {
            color: `#${new THREE.Color(renderer.lightOptions.color ?? 0xffffff).getHexString()}`,
            intensity: renderer.lightOptions.intensity ?? 1,
            distance: renderer.lightOptions.distance ?? 0,
            decay: renderer.lightOptions.decay ?? renderer.decay,
        };
        lightOptions.addColor(lightState, 'color').name('Color').onChange((value) => {
            renderer.lightOptions.color = value;
        });
        lightOptions.add(lightState, 'intensity', 0).name('Intensity').onChange((value) => {
            renderer.lightOptions.intensity = value;
        });
        lightOptions.add(lightState, 'distance', 0).name('Distance').onChange((value) => {
            renderer.lightOptions.distance = value;
        });
        lightOptions.add(lightState, 'decay', 0).name('Decay').onChange((value) => {
            renderer.lightOptions.decay = value;
        });
    }
    buildMeshRenderer(folder, renderer) {
        const info = {
            mesh: renderer.mesh.name || renderer.mesh.uuid,
            geometry: renderer.mesh.geometry.type,
            material: Array.isArray(renderer.mesh.material)
                ? `${renderer.mesh.material.length} materials`
                : renderer.mesh.material.type,
            capacity: renderer.instances.instanceMatrix.count,
        };
        folder.add(info, 'mesh').name('Mesh').disable();
        folder.add(info, 'geometry').name('Geometry').disable();
        folder.add(info, 'material').name('Material').disable();
        folder.add(info, 'capacity').name('Capacity').disable();
    }
    buildTrailRenderer(folder, renderer) {
        const modeState = {
            mode: renderer.mode,
        };

        folder.add(modeState, 'mode', {
            Particle: TrailMode.Particle,
            Ribbon: TrailMode.Ribbon,
        }).name('Mode').onChange((value) => {
            renderer.mode = Number(value);
            this.rebuild();
        });

        folder.add(renderer, 'ratio', 0, 1).name('Ratio');

        this.addDynamicValue(
            folder,
            renderer,
            'lifetime',
            'Lifetime',
        );

        folder
            .add(renderer, 'minimumVertexDistance', 0)
            .name('Minimum Vertex Distance');

        folder
            .add(renderer, 'dieWithParticles')
            .name('Die With Particles');

        if (renderer.mode === TrailMode.Ribbon) {
            folder
                .add(renderer, 'ribbonCount', 1)
                .step(1)
                .name('Ribbon Count');
        }

        const textureState = {
            textureMode: renderer.textureMode,
        };

        folder.add(textureState, 'textureMode', {
            Stretch: TrailTextureMode.Stretch,
            Tile: TrailTextureMode.Tile,
            'Repeat Per Segment': TrailTextureMode.RepeatPerSegment,
            'Distribute Per Segment': TrailTextureMode.DistributePerSegment,
        }).name('Texture Mode').onChange((value) => {
            renderer.textureMode = Number(value);
        });

        this.addDynamicValue(
            folder,
            renderer,
            'width',
            'Width',
        );

        this.addDynamicValue(
            folder,
            renderer,
            'widthOverTrail',
            'Width Over Trail',
        );

        folder
            .add(renderer, 'sizeAffectsWidth')
            .name('Size Affects Width');

        folder
            .add(renderer, 'sizeAffectsLifetime')
            .name('Size Affects Lifetime');

        folder
            .add(renderer, 'inheritParticleColor')
            .name('Inherit Particle Color');

        this.addDynamicValue(
            folder,
            renderer,
            'colorOverLifetime',
            'Color Over Lifetime',
        );

        this.addDynamicValue(
            folder,
            renderer,
            'colorOverTrail',
            'Color Over Trail',
        );

        this.buildTrailMaterialFolder(
            folder.addFolder('Material'),
            renderer,
        );
    }
    buildTrailMaterialFolder(folder, renderer) {
        const materials = Array.isArray(renderer.material)
            ? renderer.material
            : [renderer.material];

        const material = materials[0];

        if (!material) {
            return;
        }

        const info = {
            type: material.type,
        };

        folder
            .add(info, 'type')
            .name('Type')
            .disable();

        if ('color' in material && material.color instanceof THREE.Color) {
            const state = {
                color: `#${material.color.getHexString()}`,
            };

            folder
                .addColor(state, 'color')
                .name('Color')
                .onChange((value) => {
                    material.color.set(value);
                });
        }

        if ('opacity' in material) {
            folder
                .add(material, 'opacity', 0, 1)
                .name('Opacity');
        }

        if ('roughness' in material) {
            folder
                .add(material, 'roughness', 0, 1)
                .name('Roughness');
        }

        if ('metalness' in material) {
            folder
                .add(material, 'metalness', 0, 1)
                .name('Metalness');
        }

        if (
            'emissive' in material
            && material.emissive instanceof THREE.Color
        ) {
            const state = {
                emissive: `#${material.emissive.getHexString()}`,
            };

            folder
                .addColor(state, 'emissive')
                .name('Emissive')
                .onChange((value) => {
                    material.emissive.set(value);
                });
        }

        if ('emissiveIntensity' in material) {
            folder
                .add(material, 'emissiveIntensity', 0)
                .name('Emissive Intensity');
        }

        if ('wireframe' in material) {
            folder
                .add(material, 'wireframe')
                .name('Wireframe');
        }
    }
    addObject(
        folder,
        object,
        hidden = new Set(),
        seen = new WeakSet(),
    ) {
        if (
            !object
            || typeof object !== 'object'
            || seen.has(object)
        ) {
            return;
        }

        seen.add(object);

        Object.keys(object)
            .filter(
                (key) =>
                    !key.startsWith('_')
                    && !hidden.has(key)
            )
            .forEach(
                (key) =>
                    this.addValue(
                        folder,
                        object,
                        key,
                        this.prettyName(key),
                        seen,
                    )
            );
    }
    addValue(
        folder,
        object,
        key,
        label,
        seen = new WeakSet(),
    ) {
        const value = object[key];
        if (typeof value === 'function') {
            const state = { value: 'ƒ(t) — function driven' };
            folder.add(state, 'value').name(label).disable();
            return;
        }
        if (value instanceof THREE.Vector3) {
            this.addVector3(folder.addFolder(label), value, label);
            return;
        }
        if (value instanceof THREE.Vector2) {
            this.addVector2(folder.addFolder(label), value, label);
            return;
        }
        if (value instanceof THREE.Color) {
            const state = { color: `#${value.getHexString()}` };
            folder.addColor(state, 'color').name(label).onChange((hex) => value.set(hex));
            return;
        }
        if (Array.isArray(value)) {
            const arrayFolder =
                folder.addFolder(label);

            value.forEach(
                (_, index) =>
                    this.addValue(
                        arrayFolder,
                        value,
                        String(index),
                        index === 0
                            ? 'Min / 0'
                            : 'Max / 1',
                        seen,
                    )
            );

            return;
        }
        if (value && typeof value === 'object') {
            if (seen.has(value)) {
                return;
            }

            this.addObject(
                folder.addFolder(label),
                value,
                new Set(),
                seen,
            );

            return;
        }
        if (typeof value === 'number') {
            folder.add(object, key).name(label);
        }
        else if (typeof value === 'boolean' || typeof value === 'string') {
            folder.add(object, key).name(label);
        }
        else if (value === undefined || value === null) {
            const state = { value: String(value) };
            folder.add(state, 'value').name(label).disable();
        }
    }
    addDynamicValue(folder, object, key, label) {
        const value = object[key];
        if (typeof value === 'function') {
            const state = { mode: 'Function', value: 'ƒ(t)' };
            folder.add(state, 'mode').name(`${label} Mode`).disable();
            folder.add(state, 'value').name(label).disable();
            return;
        }
        if (Array.isArray(value) && value.length === 2) {
            const sub = folder.addFolder(label);
            const state = { mode: 'Random Between' };
            sub.add(state, 'mode').name('Mode').disable();
            this.addValue(sub, value, '0', 'Min');
            this.addValue(sub, value, '1', 'Max');
            return;
        }
        this.addValue(folder, object, key, label);
    }
    addVector3(folder, vector, label) {
        folder.add(vector, 'x').name(`${label} X`);
        folder.add(vector, 'y').name(`${label} Y`);
        folder.add(vector, 'z').name(`${label} Z`);
    }
    addVector2(folder, vector, label, onFinishChange) {
        const x = folder.add(vector, 'x').name(`${label} X`);
        const y = folder.add(vector, 'y').name(`${label} Y`);
        if (onFinishChange) {
            x.onFinishChange(onFinishChange);
            y.onFinishChange(onFinishChange);
        }
    }
    reloadSpriteMaterial(renderer) {
        renderer.loadMaterial?.();
    }
    geometryShapeName(geometry) {
        if (geometry.type.includes('Box'))
            return 'Box';
        if (geometry.type.includes('Cone'))
            return 'Cone';
        if (geometry.type.includes('Torus'))
            return 'Torus';
        return 'Sphere';
    }
    emitCode() {
        this.onCodeChange?.(this.generateCode());
    }
    serializeParticleSystem() {
        const imports = new Set(['ParticleSystem', 'Emitter', 'EmissionShape', 'EmissionSource']);
        this.system.modules.forEach((module) => imports.add(module.constructor.name));
        this.system.renderers.forEach((renderer) => imports.add(renderer.constructor.name));
        const emitters = this.system.emitters.map((emitter) => this.serializeEmitter(emitter)).join(',\n');
        const modules = this.system.modules.map((module) => this.serializeModule(module)).join(',\n');
        const renderers = this.system.renderers.map((renderer) => this.serializeRenderer(renderer)).join(',\n');
        return [
            `import * as THREE from 'three';`,
            `import { ${Array.from(imports).sort().join(', ')} } from 'rmps';`,
            '',
            'const particleSystem = new ParticleSystem({',
            `  gravity: ${this.serializeValue(this.system.gravity)},`,
            `  gravityModifier: ${this.serializeValue(this.system.gravityModifier)},`,
            '  emitters: [',
            this.indent(emitters, 4),
            '  ],',
            '  modules: [',
            this.indent(modules, 4),
            '  ],',
            '  renderers: [',
            this.indent(renderers, 4),
            '  ],',
            '});',
            '',
            'export default particleSystem;',
            '',
        ].join('\n');
    }
    serializeEmitter(emitter) {
        const initialValues = this.serializeValue(emitter.initialValues);
        const bursts = this.serializeValue(emitter.bursts.map(({ time, count }) => ({ time, count })));
        return [
            'new Emitter({',
            `  source: ${this.serializeEmissionShape(emitter.source)},`,
            `  rate: ${this.serializeValue(emitter.rate)},`,
            `  duration: ${this.serializeValue(emitter.duration)},`,
            `  looping: ${this.serializeValue(emitter.looping)},`,
            `  bursts: ${bursts},`,
            `  initialValues: ${initialValues},`,
            '})',
        ].join('\n');
    }
    serializeEmissionShape(shape) {
        const geometry = shape.geometry;
        const params = geometry.parameters ?? {};
        let expression;
        if (geometry.type.includes('Box')) {
            expression = `EmissionShape.Box(${params.width ?? 1}, ${params.height ?? 1}, ${params.depth ?? 1})`;
        }
        else if (geometry.type.includes('Cone')) {
            expression = `EmissionShape.Cone(${params.radius ?? 1}, ${params.height ?? 1}, ${params.radialSegments ?? 16})`;
        }
        else if (geometry.type.includes('Torus')) {
            expression = `EmissionShape.Torus(${params.radius ?? 1}, ${params.tube ?? 0.4}, ${params.radialSegments ?? 16}, ${params.tubularSegments ?? 32}, ${params.arc ?? Math.PI * 2})`;
        }
        else {
            expression = `EmissionShape.Sphere(${params.radius ?? 1}, ${params.widthSegments ?? params.radialSegments ?? 16}, ${params.heightSegments ?? 8})`;
        }
        if (shape.source === EmissionSource.Volume)
            return expression;
        return `Object.assign(${expression}, { source: EmissionSource.${this.emissionSourceName(shape.source)} })`;
    }
    serializeModule(module) {
        if (module instanceof NoiseModule) {
            const runtime = module;
            return `new NoiseModule(${JSON.stringify(runtime.key)}, ${this.serializeValue({
                octaves: runtime.octaves,
                frequency: runtime.frequency,
                lacunarity: runtime.lacunarity,
                persistence: runtime.persistence,
                time: runtime.time,
                offset: runtime.offset,
            })})`;
        }
        const runtime = module;
        const args = runtime.options !== undefined ? this.serializeValue(runtime.options) : this.serializeValue(runtime);
        return `new ${module.constructor.name}(${args})`;
    }
    serializeRenderer(renderer) {
        if (renderer instanceof SpriteRenderer) {
            const texture = this.serializeTexture(renderer.texture);
            const options = this.serializeValue({
                fps: renderer.fps,
                tileSize: renderer.tileSize,
                tileMargin: renderer.tileMargin,
                gridSize: renderer.gridSize,
                frames: renderer.frames,
                alphaMap: renderer.alphaMap ? this.textureSource(renderer.alphaMap) : undefined,
                material: renderer.materialType,
                materialOptions: renderer.materialOptions,
            });
            return `new SpriteRenderer(${texture}, ${options})`;
        }
        if (renderer instanceof LightRenderer) {
            return `new LightRenderer(${this.serializeValue({
                brightness: renderer.brightness,
                rangeMultiplier: renderer.rangeMultiplier,
                groupingRadiusRatio: renderer.groupingRadiusRatio,
                decay: renderer.decay,
                count: renderer.count,
                ratio: renderer.ratio,
                randomDistribution: renderer.randomDistribution,
                useParticleColor: renderer.useParticleColor,
                sizeAffectsRange: renderer.sizeAffectsRange,
                alphaAffectsIntensity: renderer.alphaAffectsIntensity,
                lightOptions: renderer.lightOptions,
            })})`;
        }
        if (renderer instanceof MeshRenderer) {
            return `new MeshRenderer({\n  mesh: ${this.serializeMesh(renderer.mesh)},\n  maxParticles: ${renderer.instances.instanceMatrix.count},\n})`;
        }
        if (renderer instanceof TrailRenderer) {
            return [
                'new TrailRenderer({',
                `  mode: ${this.serializeValue(renderer.mode)},`,
                `  ratio: ${this.serializeValue(renderer.ratio)},`,
                `  lifetime: ${this.serializeValue(renderer.lifetime)},`,
                `  minimumVertexDistance: ${this.serializeValue(renderer.minimumVertexDistance)},`,
                `  dieWithParticles: ${this.serializeValue(renderer.dieWithParticles)},`,
                `  ribbonCount: ${this.serializeValue(renderer.ribbonCount)},`,
                `  textureMode: ${this.serializeValue(renderer.textureMode)},`,
                `  width: ${this.serializeValue(renderer.width)},`,
                `  widthOverTrail: ${this.serializeValue(renderer.widthOverTrail)},`,
                `  sizeAffectsWidth: ${this.serializeValue(renderer.sizeAffectsWidth)},`,
                `  sizeAffectsLifetime: ${this.serializeValue(renderer.sizeAffectsLifetime)},`,
                `  inheritParticleColor: ${this.serializeValue(renderer.inheritParticleColor)},`,
                `  colorOverLifetime: ${this.serializeValue(renderer.colorOverLifetime)},`,
                `  colorOverTrail: ${this.serializeValue(renderer.colorOverTrail)},`,
                `  materialOptions: ${this.serializeMaterialOptions(renderer.material)},`,
                '})',
            ].join('\n');
        }
        return `new ${renderer.constructor.name}(${this.serializeValue(renderer)})`;
    }
    serializeMesh(mesh) {
        const geometry = mesh.geometry;
        const geometryCtor = geometry.type;
        const params = geometry.parameters;
        const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const geometryExpression = params
            ? `new THREE.${geometryCtor}(${Object.values(params).map((value) => this.serializeValue(value)).join(', ')})`
            : `new THREE.BufferGeometry() /* replace with ${geometry.type} */`;
        const materialExpression = material
            ? `new THREE.${material.type}(${this.serializeMaterialOptions(material)})`
            : 'new THREE.MeshStandardMaterial()';
        return `new THREE.Mesh(${geometryExpression}, ${materialExpression})`;
    }
    serializeMaterialOptions(material) {
        if (!material) {
            return '{}';
        }

        const options = {};

        if (material.color) {
            options.color = material.color;
        }

        if (
            material.opacity !== undefined
            && material.opacity !== 1
        ) {
            options.opacity = material.opacity;
        }

        if (material.transparent) {
            options.transparent = true;
        }

        if (material.wireframe) {
            options.wireframe = true;
        }

        if (material.roughness !== undefined) {
            options.roughness = material.roughness;
        }

        if (material.metalness !== undefined) {
            options.metalness = material.metalness;
        }

        if (material.emissive) {
            options.emissive = material.emissive;
        }

        if (
            material.emissiveIntensity !== undefined
            && material.emissiveIntensity !== 1
        ) {
            options.emissiveIntensity =
                material.emissiveIntensity;
        }

        if (
            material.side !== undefined
            && material.side !== THREE.FrontSide
        ) {
            options.side = material.side;
        }

        if (!material.depthWrite) {
            options.depthWrite = false;
        }

        return this.serializeValue(options);
    }
    serializeTexture(texture) {
        const source = this.textureSource(texture);
        return source !== undefined
            ? JSON.stringify(source)
            : `undefined /* texture ${JSON.stringify(texture.name || texture.uuid)} must be supplied manually */`;
    }
    textureSource(texture) {
        const image = texture.image;
        return image?.currentSrc || image?.src || undefined;
    }
    serializeValue(value, seen = new WeakSet()) {
        if (value === undefined)
            return 'undefined';
        if (value === null)
            return 'null';
        if (typeof value === 'string')
            return JSON.stringify(value);
        if (typeof value === 'number' || typeof value === 'boolean')
            return String(value);
        if (typeof value === 'function')
            return value.toString();
        if (value instanceof THREE.Vector3)
            return `new THREE.Vector3(${value.x}, ${value.y}, ${value.z})`;
        if (value instanceof THREE.Vector2)
            return `new THREE.Vector2(${value.x}, ${value.y})`;
        if (value instanceof THREE.Color)
            return `new THREE.Color(${JSON.stringify(`#${value.getHexString()}`)})`;
        if (value instanceof THREE.Euler)
            return `new THREE.Euler(${value.x}, ${value.y}, ${value.z}, ${JSON.stringify(value.order)})`;
        if (Array.isArray(value)) {
            return `[${value.map((item) => this.serializeValue(item, seen)).join(', ')}]`;
        }
        if (typeof value === 'object') {
            if (seen.has(value))
                return 'undefined /* circular reference */';
            seen.add(value);
            const entries = Object.entries(value)
                .filter(([key]) => !key.startsWith('_'))
                .map(([key, item]) => `${this.serializeKey(key)}: ${this.serializeValue(item, seen)}`);
            seen.delete(value);
            return `{ ${entries.join(', ')} }`;
        }
        return 'undefined';
    }
    serializeKey(key) {
        return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
    }
    emissionSourceName(source) {
        if (source === EmissionSource.Surface)
            return 'Surface';
        if (source === EmissionSource.Vertices)
            return 'Vertices';
        return 'Volume';
    }
    indent(value, spaces) {
        if (!value)
            return '';
        const prefix = ' '.repeat(spaces);
        return value.split('\n').map((line) => `${prefix}${line}`).join('\n');
    }
    prettyName(value) {
        return value
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/^./, (c) => c.toUpperCase());
    }
    injectStyles() {
        const id = 'particle-system-gui-styles';
        if (document.getElementById(id))
            return;
        const style = document.createElement('style');
        style.id = id;
        style.textContent = `
      .lil-gui .psgui-section {
        margin-top: 10px;
        border-top: 3px solid rgba(255,255,255,.22);
        padding-top: 4px;
      }
      .lil-gui .psgui-emitters { border-top-color: #55aaff; }
      .lil-gui .psgui-modules { border-top-color: #b980ff; }
      .lil-gui .psgui-renderers { border-top-color: #ff9d57; }
      .lil-gui .psgui-demo { border-top-color: #66d19e; }
      .lil-gui .psgui-system { margin-top: 6px; }
    `;
        document.head.appendChild(style);
    }
}
