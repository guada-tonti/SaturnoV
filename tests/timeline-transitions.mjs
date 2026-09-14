// node tests/timeline-transitions.mjs <three.module.mjs> <gsap.cjs>
// Use the same Three.js / GSAP versions declared in index.html.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
process.on('uncaughtException', error => { console.error(error.message); process.exit(1); });
const threeURL = pathToFileURL(process.argv[2]).href;
const THREE = await import(threeURL);
const { gsap } = (await import(pathToFileURL(process.argv[3]).href)).default;
globalThis.window = { gsap };
globalThis.document = { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => {} }) }) };
async function source(path) {
  const code = (await readFile(new URL(path, import.meta.url), 'utf8')).replaceAll("from 'three'", `from '${threeURL}'`);
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}
const { RocketBuilder } = await source('../js/three/RocketBuilder.js');
const { StageAnimator } = await source('../js/three/StageAnimator.js');
const { TimelineTransitions } = await source('../js/three/TimelineTransitions.js');
const { MISSION_STAGES } = await source('../js/data/missionData.js');
const root = new THREE.Group();
const parts = new RocketBuilder().buildCompleteRocket(root);
const scene = { rocketRoot: root };
const camera = { cancel() {}, autoFrameStage() {}, moveTo() {}, frameForStage() {
  return { position: new THREE.Vector3(), target: new THREE.Vector3(), pivot: new THREE.Vector3() };
} };
const animator = new StageAnimator(parts, scene, { setStageEffects() {} });
const controller = new TimelineTransitions(animator, camera, MISSION_STAGES);
const comparable = state => state.slice(1).map(s => [s.position.toArray(), s.quaternion.toArray(), s.scale.toArray(), s.visible]);
function finish(index) {
  controller.tween?.progress(1);
  assert.deepEqual(comparable(controller.capture()), comparable(controller.stateAt(index)), `final stage ${index + 1}`);
  assert.equal(scene.isVehicleTransitioning, false);
}
for (let from = 0; from < 24; from++) {
  for (let to = 0; to < 24; to++) {
    controller.setStageState(from);
    controller.transitionTo(to);
    finish(to);
  }
}
// Interruption at different points must never leave a hybrid state or a live tween.
for (const fraction of [0.01, 0.35, 0.9]) {
  for (let to = 1; to < 24; to++) {
    controller.setStageState(0);
    controller.transitionTo(9);
    controller.tween?.progress(fraction);
    controller.transitionTo(to);
    finish(to);
  }
}
controller.setStageState(0);
controller.transitionTo(11); // Only docking -> extraction: no S-IC/S-II/LES.
assert.equal(parts.s1c.visible, false);
assert.equal(parts.s2.visible, false);
assert.equal(parts.les.visible, false);
assert.equal(parts.s4b.visible, true);
assert.equal(parts.sla.visible, true);
assert.ok(Math.abs(parts.sla.userData.petals[0].rotation.x - Math.PI / 4) < 1e-8);
finish(11);
assert.equal(parts.s4b.visible, false);
// A rigid CSM retains its joint throughout transposition and return orientation changes.
for (const target of [9, 18, 19]) {
  controller.setStageState(target - 1);
  controller.transitionTo(target);
  for (const fraction of [0.1, 0.5, 0.9]) {
    controller.tween.progress(fraction);
    if (target === 19) assert.equal(parts.lm.userData.descentStage.visible, false, "discarded descent stage must not reappear");
    assert.ok(Math.abs(parts.cm.position.distanceTo(parts.sm.position) - 2.23) < 1e-6);
  }
  finish(target);
}
// Cached state construction may not overwrite the user's global viewing orientation.
root.position.set(4, 7, 3);
root.rotation.set(0, 0.7, 0);
const rootPosition = root.position.clone(), rootRotation = root.quaternion.clone();
controller.setStageState(15);
controller.transitionTo(16);
finish(16);
assert.ok(root.position.equals(rootPosition));
assert.ok(root.quaternion.equals(rootRotation));
// Camera aliases and hidden geometry: ascent must frame the cabin, not the whole rocket.
window.innerWidth = 1280;
window.innerHeight = 720;
window.addEventListener = () => {};
document.getElementById = id => ({ getBoundingClientRect: () => id === 'timeline-container'
  ? { right: 392 } : { left: 868 } });
const { CameraChoreographer } = await source('../js/three/CameraChoreographer.js');
const viewCamera = new THREE.PerspectiveCamera(38, 1280 / 720, 0.1, 1000);
viewCamera.position.set(0, 15, 60);
const controls = { target: new THREE.Vector3(0, 15, 0), update() {} };
const framing = new CameraChoreographer(viewCamera, controls, parts, scene);
controller.setStageState(17);
const ascentFrame = framing.frameForStage(MISSION_STAGES[17]);
const ascentCenter = new THREE.Box3().setFromObject(parts.lm.userData.ascentStage).getCenter(new THREE.Vector3());
assert.ok(ascentFrame.target.distanceTo(ascentCenter) < 1e-6);
assert.ok(ascentFrame.position.distanceTo(ascentFrame.target) < 30);
controller.setStageState(15);
const descentFrame = framing.frameForStage(MISSION_STAGES[15]);
controller.setStageState(16);
const landedFrame = framing.frameForStage(MISSION_STAGES[16]);
assert.ok(descentFrame.target.distanceTo(landedFrame.target) < 1e-6);
assert.ok(descentFrame.position.distanceTo(landedFrame.position) < 1e-6);
controller.cancel();
assert.equal(gsap.globalTimeline.getChildren().length, 0, 'no leftover tweens');
gsap.ticker.sleep();
console.log('PASS: 576 origin/destination pairs, 69 interruptions, extraction visibility, rigid CSM joints, root preservation and camera framing.');
