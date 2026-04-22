import { Canvas } from "@react-three/fiber";
import { Experience } from "../../components/Experience";
import { SocketManager } from "../../components/SocketManager";
import { ChatBox } from "../../components/ChatBox";
import { OnlinePlayersList } from "../../components/OnlinePlayersList";

function MetaVerse() {
  return (
    <>
      <SocketManager />
      <OnlinePlayersList />
      <ChatBox />
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 30 }}>
        <color attach="background" args={["#ececec"]} />
        <Experience />
      </Canvas>
    </>
  );
}

export default MetaVerse;
