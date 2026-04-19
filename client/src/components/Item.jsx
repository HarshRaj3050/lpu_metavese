import { useGLTF } from "@react-three/drei"

export const Item = ({
    name, 
}) => {
    const {scene} = useGLTF(`/models/items/${name}.glb`);

    return <primitive object={scene} />;
}