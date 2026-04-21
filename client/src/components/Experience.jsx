import { ContactShadows, Environment, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AnimatedWoman } from "./AnimatedWoman";
import { charactersAtom, socket } from "./SocketManager";
import { Item } from "./Item";

const MOVE_SPEED = 5;       // units per second (delta-time based)
const CAM_DISTANCE = 8;
const CAM_HEIGHT = 4;
const CAM_LERP = 0.1;       // much smoother camera follow
const EMIT_INTERVAL = 50;   // ms between socket emits (~20 updates/sec)

// ─── Keyboard hook ────────────────────────────────────────────
function useKeys() {
  const keys = useRef({});
  useEffect(() => {
    const down = (e) => (keys.current[e.code] = true);
    const up   = (e) => (keys.current[e.code] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return keys;
}

// ─── Third-person controller ──────────────────────────────────
function ThirdPersonController({ characters }) {
  const { camera, gl } = useThree();
  const keys = useKeys();

  const yaw   = useRef(Math.PI);  // horizontal camera angle
  const pitch = useRef(0.4);      // vertical camera angle (radians)
  const charPos = useRef(new THREE.Vector3(0, 0, 0));
  const isLocked = useRef(false);
  const lastEmitTime = useRef(0);

  // Pre-allocated vectors to avoid per-frame garbage collection
  const _forward = useRef(new THREE.Vector3());
  const _right   = useRef(new THREE.Vector3());
  const _move    = useRef(new THREE.Vector3());
  const _camTarget = useRef(new THREE.Vector3());
  const _lookAt  = useRef(new THREE.Vector3());

  // Pointer lock — click canvas to capture mouse
  useEffect(() => {
    const canvas = gl.domElement;

    const lock = () => canvas.requestPointerLock();

    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };

    const onMouseMove = (e) => {
      if (!isLocked.current) return;
      yaw.current   -= e.movementX * 0.002;
      pitch.current  = Math.max(-0.1, Math.min(1.0, pitch.current + e.movementY * 0.002));
    };

    canvas.addEventListener("click", lock);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      canvas.removeEventListener("click", lock);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl]);

  useFrame((_, delta) => {
    // Cap delta to avoid huge jumps on tab-switch or lag spikes
    const dt = Math.min(delta, 0.1);

    // Sync local position from server on first load
    const me = characters.find((c) => c.id === socket.id);
    if (me && charPos.current.lengthSq() === 0) {
      charPos.current.set(...me.position);
    }

    // Direction vectors derived from camera yaw (reuse pre-allocated vectors)
    const forward = _forward.current.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right   = _right.current.set( Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    const move    = _move.current.set(0, 0, 0);

    if (keys.current["KeyW"] || keys.current["ArrowUp"])    move.add(forward);
    if (keys.current["KeyS"] || keys.current["ArrowDown"])  move.sub(forward);
    if (keys.current["KeyA"] || keys.current["ArrowLeft"])  move.sub(right);
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) move.add(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED * dt);
      charPos.current.add(move);
      // Clamp to floor bounds
      charPos.current.x = Math.max(-24, Math.min(24, charPos.current.x));
      charPos.current.z = Math.max(-24, Math.min(24, charPos.current.z));

      // Throttle socket emissions to avoid flooding the server
      const now = performance.now();
      if (now - lastEmitTime.current >= EMIT_INTERVAL) {
        lastEmitTime.current = now;
        socket.emit("move", [charPos.current.x, 0, charPos.current.z]);
      }
    }

    // Camera: spherical orbit around character (reuse vectors)
    const cosP = Math.cos(pitch.current);
    const sinP = Math.sin(pitch.current);
    _camTarget.current.set(
      charPos.current.x +  Math.sin(yaw.current) * CAM_DISTANCE * cosP,
      charPos.current.y +  sinP * CAM_DISTANCE + CAM_HEIGHT * 0.3,
      charPos.current.z +  Math.cos(yaw.current) * CAM_DISTANCE * cosP
    );

    camera.position.lerp(_camTarget.current, CAM_LERP);
    _lookAt.current.set(charPos.current.x, charPos.current.y + 1.5, charPos.current.z);
    camera.lookAt(_lookAt.current);
  });

  return null;
}

// ─── Experience ───────────────────────────────────────────────
export const Experience = () => {
  const [characters] = useAtom(charactersAtom);
  const [onFloor, setOnFloor] = useState(false);
  useCursor(onFloor);

  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.3} />
      <ContactShadows blur={2} />

      <Item name={"lpu34"}></Item>

      <ThirdPersonController characters={characters} />

      <mesh
        rotation-x={-Math.PI / 2}
        position-y={-0.001}
        onPointerEnter={() => setOnFloor(true)}
        onPointerLeave={() => setOnFloor(false)}
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {characters.map((character) => (
        <AnimatedWoman
          key={character.id}
          position={new THREE.Vector3(...character.position)}
          hairColor={character.hairColor}
          topColor={character.topColor}
          bottomColor={character.bottomColor}
        />
      ))}
    </>
  );
};