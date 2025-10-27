'use client';

import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

function PigeonModel() {
  const { scene } = useGLTF('/models/cf3eab1f-c4c2-43fc-9a8d-0583cf824574.glb');
  return <primitive object={scene} scale={0.2} position={[0, -0.3, 0]} />;
}

export default function Pigeon3D() {
  return (
    <div className="w-full h-[450px]">
      <Canvas camera={{ position: [0, 0, 1.5], fov: 50 }} style={{ background: 'transparent' }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.05} />
          <directionalLight position={[0, 0.5, 0.5]} intensity={2.5} target-position={[0, 0, 0]} />
          <directionalLight position={[-0.3, 0.3, 0.3]} intensity={2} target-position={[0, 0, 0]} />
          <directionalLight position={[0.3, 0.3, 0.3]} intensity={2} target-position={[0, 0, 0]} />
          <spotLight
            position={[0, 0.8, 0.5]}
            intensity={4}
            angle={0.1}
            penumbra={0.1}
            target-position={[0, 0, 0]}
          />
          <PigeonModel />
          <OrbitControls />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
