import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Group, Mesh } from "three";
import { Children } from 'react';

function Box(props) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef<Mesh>();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (meshRef?.current)
      meshRef.current.rotation.x += delta
  })
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

export default function TestThreeJs(props) {
  return (
    <Canvas>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <group scale={1/75} rotation={[Math.PI / 2, 0, -Math.PI / 8]}>
        <Joint>
          <UpperArm />
          <Joint position={[100, 0, 0]}>
            <UpperArm />
            <Joint position={[100, 0, 0]}>
              <PrintHead />
            </Joint>
          </Joint>
        </Joint>
      </group>
    </Canvas>
  );
}

function Joint(props) {
  // This reference will give us direct access to the mesh
  const groupRef = useRef<Group>();
  const meshRef = useRef<Mesh>();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (groupRef?.current) {
      // console.log(delta);
      groupRef.current.rotation.y += delta / 2;
    }
  });
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <group ref={groupRef} {...props}>
      {props.children}
    </group>
  );
}

function UpperArm(props) {
  return (
    <group {...props}>
      <mesh>
        <cylinderGeometry args={[20, 20, 60, 32]} />
        <meshStandardMaterial color={"gray"} />
      </mesh>
      <mesh position={[50, 0, 0]}>
        <boxGeometry args={[100, 20, 20]} />
        <meshStandardMaterial color={"gray"} />
      </mesh>
    </group>
  );
}

function PrintHead(props) {
  return (
    <group {...props}>
      <mesh>
        <cylinderGeometry args={[20, 20, 40, 32]} />
        <meshStandardMaterial color={"green"} />
      </mesh>
      <mesh position={[20, 0, 0]}>
        <boxGeometry args={[30, 15, 15]} />
        <meshStandardMaterial color={"green"} />
      </mesh>
    </group>
  );
}