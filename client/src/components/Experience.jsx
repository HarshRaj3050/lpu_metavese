import { ContactShadows, Environment, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AnimatedWoman } from "./AnimatedWoman";
import { charactersAtom, socket } from "./SocketManager";
import { Item } from "./Item";

const MOVE_SPEED = 0.04;
const CAM_DISTANCE = 10;
const CAM_HEIGHT = 4;
const CAM_LERP = 0.01;

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
  const charPos = useRef(new THREE.Vector3());
  const isLocked = useRef(false);

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

  useFrame(() => {
    // Sync local position from server on first load
    const me = characters.find((c) => c.id === socket.id);
    if (me && charPos.current.lengthSq() === 0) {
      charPos.current.set(...me.position);
    }

    // Direction vectors derived from camera yaw
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right   = new THREE.Vector3( Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    const move    = new THREE.Vector3();

    if (keys.current["KeyW"] || keys.current["ArrowUp"])    move.add(forward);
    if (keys.current["KeyS"] || keys.current["ArrowDown"])  move.sub(forward);
    if (keys.current["KeyA"] || keys.current["ArrowLeft"])  move.sub(right);
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) move.add(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED);
      charPos.current.add(move);
      // Clamp to floor bounds
      charPos.current.x = Math.max(-24, Math.min(24, charPos.current.x));
      charPos.current.z = Math.max(-24, Math.min(24, charPos.current.z));
      socket.emit("move", [charPos.current.x, 0, charPos.current.z]);
    }

    // Camera: spherical orbit around character
    const cosP = Math.cos(pitch.current);
    const sinP = Math.sin(pitch.current);
    const target = new THREE.Vector3(
      charPos.current.x +  Math.sin(yaw.current) * CAM_DISTANCE * cosP,
      charPos.current.y +  sinP * CAM_DISTANCE + CAM_HEIGHT * 0.3,
      charPos.current.z +  Math.cos(yaw.current) * CAM_DISTANCE * cosP
    );

    camera.position.lerp(target, CAM_LERP);
    camera.lookAt(charPos.current.clone().add(new THREE.Vector3(0, 1.5, 0)));
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