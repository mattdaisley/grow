import React, { useCallback, useRef, useState, useLayoutEffect } from "react";
import { Canvas, useFrame } from '@react-three/fiber'
import { Group, Mesh, Line, Vector3 } from "three";
import { Children } from 'react';

const degressToRadians = (degrees: number) => (degrees * Math.PI) / 180;
const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

// const inverseKinematics = (x: number, y: number, z: number) => {
//   const l1 = 100;
//   const l2 = 100;
//   const l3 = 40;
//   const d = Math.sqrt(x * x + y * y);
//   const j1 = Math.atan2(y, x);
//   const j3 = Math.acos((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2));
//   const j2 = Math.atan2(z, d) - Math.atan2(l2 * Math.sin(j3), l1 + l2 * Math.cos(j3));
//   return { j1, j2, j3 };
// }

const inverseKinematics = (x: number, y: number, z: number): {j1:number, j2:number, j3:number} => {
  const l1 = 100;
  const l2 = 100;

  let j1 = 0;
  let j2 = 0;

  const hypontenus = Math.sqrt(x * x + z * z);

  // gamma is the angle from the x-axis to to the point in the x-z plane
  const gamma = Math.atan2(z, x);

  // law of cosines
  // a and b are sides of the triangle
  // c is the hypotenuse
  // C is the angle opposite of side
  // sq(c) = sq(a) + sq(b) - 2*a*b*cos(C)
  // sq(c) + 2*a*bcos(C) = sq(a) + sq(c)
  // 2*a*b*cos(C) = sq(a) + sq(b) - sq(c)
  // cos(C) = ( sq(a) + sq(b) - sq(c) ) / 2*a*b
  // C = acos( ( sq(a) + sq(b) - sq(c) ) / 2*a*b )

  // beta is the angle between the two arm segments
  // sq(c)          = sq(a)  + sq(b)  - 2*a*b*cos(C)
  // sq(hypontenus) = sq(l1) + sq(l2) - 2*l1*l2*cos(beta)
  // beta = = acos( ( sq(l1) + sq(l2) - sq(hypontenus) ) / 2*l1*l2 )
  const beta = Math.acos(
    (l2 * l2 + l1 * l1 - hypontenus * hypontenus) / (2 * l1 * l2)
  );

  // alpha is the angle from the arm 1 to the point
  // sq(c)  = sq(a)          + sq(b)  - 2*a*b*cos(C)
  // sq(l2) = sq(hypontenus) + sq(l1) - 2*hypontenus*l1*cos(alpha)
  // alpha = acos( ( sq(hypontenus) + sq(l1) - sq(l2) ) / 2*hypontenus*l1 )
  const alpha = Math.acos(
    (hypontenus * hypontenus + l1 * l1 -l2 * l2) / (2 * hypontenus * l1)
  );

  // j1 = gamma + alpha;
  // j2 = beta - Math.PI;
  j1 = gamma - alpha;
  j2 = Math.PI - beta;
  // j2 = degressToRadians(hypontenus - 180)

  console.log(
    `hypotenus: ${hypontenus} gamma: ${radiansToDegrees(
      gamma
    )} alpha: ${radiansToDegrees(alpha)} beta: ${radiansToDegrees(
      beta
    )} j1: ${radiansToDegrees(j1)} j2: ${radiansToDegrees(j2)}`
  );

  return { j1, j2, j3: 0 };
};

export default function TestThreeJs(props) {
  // const [angles, setAngles] = useState({ j1: degressToRadians(-90), j2: degressToRadians(90), j3: degressToRadians(0) });
  const [angles, setAngles] = useState<{j1:number, j2:number, j3:number}>(inverseKinematics(120, 0, -150));

  const setJoint1 = useCallback((j1: number) => {
    setAngles((prev) => ({ ...prev, j1 }));
  }, [angles, setAngles]);

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
      {/* <group rotation={[-Math.PI / 2, -Math.PI / 8, -Math.PI / 8]}> */}
      <group rotation={[-Math.PI / 2.5, 0, Math.PI / 16]} position={[0, -.5, 0]}>
        <group scale={1 / 65}>
          <Joint angle={angles.j1}>
            <UpperArm />
            <Joint position={[100, 0, 0]} angle={angles.j2}>
              <UpperArm />
              <Joint position={[100, 0, 0]} angle={angles.j3}>
                <PrintHead />
              </Joint>
            </Joint>
          </Joint>

          <mesh>
            <planeGeometry args={[400, 400]} />
            <meshBasicMaterial color={"dimgray"} transparent={true} opacity={1} />
          </mesh>
          <mesh>
            <sphereGeometry args={[200, 50, 50]} />
            <meshBasicMaterial
              color={"white"}
              transparent={true}
              opacity={0.2}
            />
          </mesh>
        </group>
        <mesh>
          <sphereGeometry args={[0.05, 20, 20]} />
          <meshStandardMaterial color={"white"} />
        </mesh>
        <Axis start={[-1, 0, 0]} end={[1, 0, 0]} color={"red"} />
        <Axis start={[0, -1, 0]} end={[0, 1, 0]} color={"green"} />
        <Axis start={[0, 0, -1]} end={[0, 0, 1]} color={"blue"} />
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
    // if (groupRef?.current) {
    //   // console.log(delta);
    //   groupRef.current.rotation.y += delta / 2;
    // }
    if (groupRef?.current) {
      // console.log(delta);
      groupRef.current.rotation.y = props.angle;
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

function Axis({ start, end, color }) {
  const ref = useRef<any>();

  useLayoutEffect(() => {
    if (!ref.current || !ref.current.geometry) return;
    ref.current.geometry.setFromPoints(
      [start, end].map((point) => new Vector3(...point))
    );
  }, [start, end]);

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineDashedMaterial color={color} scale={1} linewidth={1} dashSize={1} gapSize={3} />
    </line>
  );
}