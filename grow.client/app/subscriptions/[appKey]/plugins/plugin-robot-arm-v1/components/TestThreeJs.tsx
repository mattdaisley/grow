import React, { useCallback, useRef, useState, useLayoutEffect, useEffect } from "react";
import { Canvas, useFrame } from '@react-three/fiber'
import { Group, Mesh, Line, Vector3 } from "three";
import { Children } from 'react';
import { Slider, TextField } from "@mui/material";

const degressToRadians = (degrees: number) => (degrees * Math.PI) / 180;
const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;
const scaleToDegrees = (value: number) => (value-50) / 100 * 360;

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

const l1 = 150;
const l2 = 150;
const l3 = 40;

interface InverseKinematics {
  target_x: number;
  target_y: number;
  target_z: number;
  target_z2: number;
  h0: number;
  h1: number;
  h2: number;
  h3: number;
  alpha1: number;
  alpha2: number;
  beta1: number;
  // not used in calculations so not calculated:
  // beta2: number;
  gamma1: number;
  gamma2: number;
  lambda: number;
  j0: number;
  j1: number;
  j2: number;
  j3: number;
}

const inverseKinematics = (target: {
  x: number;
  y: number;
  z: number;
}): InverseKinematics => {
  const x = target.x;
  const y = target.y;
  const z = target.z;

  let j0 = 0;
  let j1 = 0;
  let j2 = 0;
  let j3 = 0;

  const target_x = x;
  const target_y = y;
  const target_z = z;
  const target_z2 = z + l3;

  j0 = Math.atan2(target_y, target_x);

  const h0 = Math.sqrt(target_x * target_x + target_y * target_y);

  const h1 = Math.sqrt(h0 * h0 + target_z2 * target_z2); // triangle to joint 3

  // gamma is the angle from the x-axis to to the point in the x-z plane
  const gamma1 = Math.atan2(target_z2, h0);

  // law of cosines
  // a and b are sides of the triangle
  // c is the hypotenuse
  // C is the angle opposite of side
  // sq(c) = sq(a) + sq(b) - 2*a*b*cos(C)
  // sq(c) + 2*a*bcos(C) = sq(a) + sq(c)
  // 2*a*b*cos(C) = sq(a) + sq(b) - sq(c)
  // cos(C) = ( sq(a) + sq(b) - sq(c) ) / 2*a*b
  // C = acos( ( sq(a) + sq(b) - sq(c) ) / 2*a*b )

  // alpha is the angle from the arm 1 to the point
  // sq(c)  = sq(a)          + sq(b)  - 2*a*b*cos(C)
  // sq(l2) = sq(hypontenus) + sq(l1) - 2*hypontenus*l1*cos(alpha)
  // alpha = acos( ( sq(hypontenus) + sq(l1) - sq(l2) ) / 2*hypontenus*l1 )
  const alpha1 = Math.acos((h1 * h1 + l1 * l1 - l2 * l2) / (2 * h1 * l1));

  // beta is the angle between the two arm segments
  // sq(c)          = sq(a)  + sq(b)  - 2*a*b*cos(C)
  // sq(hypontenus) = sq(l1) + sq(l2) - 2*l1*l2*cos(beta)
  // beta = = acos( ( sq(l1) + sq(l2) - sq(hypontenus) ) / 2*l1*l2 )
  const beta1 = Math.acos((l2 * l2 + l1 * l1 - h1 * h1) / (2 * l1 * l2));

  j1 = gamma1 + alpha1;
  j2 = Math.PI - beta1;

  const gamma2 = Math.atan2(target_z, h0);
  const alpha2 = j1 - gamma2;
  const h2 = Math.sqrt(h0 * h0 + target_z * target_z); // triangle to extruder tip
  const h3 = Math.sqrt(l1 * l1 + h2 * h2 - 2 * l1 * h2 * Math.cos(alpha2));
  const lambda = Math.acos((l2 * l2 + l3 * l3 - h3 * h3) / (2 * l2 * l3));

  j3 = Math.PI - lambda;

  console.log(
    `hypotenus: ${h1} gamma1: ${radiansToDegrees(
      gamma1
    )} alpha1: ${radiansToDegrees(alpha1)} beta: ${radiansToDegrees(
      beta1
    )} j1: ${radiansToDegrees(j1)} j2: ${radiansToDegrees(j2)}`
  );

  return {
    target_x,
    target_y,
    target_z,
    target_z2,
    h0,
    h1,
    h2,
    h3,
    alpha1,
    alpha2,
    beta1,
    gamma1,
    gamma2,
    lambda,
    j0,
    j1,
    j2,
    j3,
  };
};

export default function TestThreeJs(props) {
  // const [angles, setAngles] = useState({ j1: degressToRadians(-90), j2: degressToRadians(90), j3: degressToRadians(0) });
  const [world, setWorld] = useState<{ rx: number; ry: number; rz: number }>({ rx: 22, ry: 0, rz: 5, });

  const [scaleTarget, setScaleTarget] = useState<{x:number, y:number, z:number}>({ x: 50, y: 0, z: 50 });
  const [target, setTarget] = useState<{x:number, y:number, z:number}>({ x: 100, y: 0, z: 100 });

  const [ik, setIk] = useState<InverseKinematics>(
    inverseKinematics(target)
  );

  const setScaleTargetX = useCallback((x: number) => setScaleTarget((t) => ({ ...t, x })), []);
  const setScaleTargetY = useCallback((y: number) => setScaleTarget((t) => ({ ...t, y })), []);
  const setScaleTargetZ = useCallback((z: number) => setScaleTarget((t) => ({ ...t, z })), []);

  const setTargetX = useCallback((x: number) => setTarget((t) => ({ ...t, x })), []);
  const setTargetY = useCallback((y: number) => setTarget((t) => ({ ...t, y })), []);
  const setTargetZ = useCallback((z: number) => setTarget((t) => ({ ...t, z })), []);

  const setWorldRx = useCallback((rx: string) => setWorld((w) => ({ ...w, rx: Number(rx) })), []);
  const setWorldRy = useCallback((ry: string) => setWorld((w) => ({ ...w, ry: Number(ry) })), []);
  const setWorldRz = useCallback((rz: string) => setWorld((w) => ({ ...w, rz: Number(rz) })), []);

  console.log(world);

  useEffect(() => {
    if (isNaN(Number(target.x)) || isNaN(Number(target.y)) || isNaN(Number(target.z))) return;

    setIk(inverseKinematics(target));
  }, [target.x, target.y, target.z]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 50,
          width: 400,
          height: 400,
          padding: 8,
          border: "1px solid gray",
          zIndex: 100,
          backgroundColor: "black",
          color: "white",
        }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ flex: 3 }}>
            <Slider
              value={scaleTarget.x}
              scale={(value) => value * 3}
              onChange={(e) => {
                setTargetX(Number(e.target.value) * 3);
                setScaleTargetX(e.target.value);
              }}
              valueLabelDisplay="auto"
            />
          </div>
          <div style={{ flex: 1 }}>
            <TextField
              type="number"
              label="X"
              value={target.x}
              onChange={(e) => {
                setTargetX(Number(e.target.value));
                setScaleTargetX(Number(e.target.value) / 3);
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 3 }}>
            <Slider
              value={scaleTarget.y}
              scale={(value) => value * 3}
              onChange={(e) => {
                setTargetY(Number(e.target.value) * 3);
                setScaleTargetY(e.target.value);
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <TextField
              type="number"
              label="Y"
              value={target.y}
              onChange={(e) => {
                setTargetY(Number(e.target.value));
                setScaleTargetY(Number(e.target.value) / 3);
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 3 }}>
            <Slider
              value={scaleTarget.z}
              scale={(value) => value * 3}
              onChange={(e) => {
                setTargetZ(Number(e.target.value) * 3);
                setScaleTargetZ(e.target.value);
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <TextField
              type="number"
              label="Z"
              value={target.z}
              onChange={(e) => {
                setTargetZ(Number(e.target.value));
                setScaleTargetZ(Number(e.target.value) / 3);
              }}
            />
          </div>
        </div>
        <div>
          <Slider
            value={world.rz}
            scale={(value) => Math.round((360 / 100) * value - 180)} // scale from 0-100 to -180-180. value = ((scaled + 180) * 100) / 360
            onChange={(e) => setWorldRz(e.target.value)}
            valueLabelDisplay="auto"
          />
        </div>
        <div>
          <Slider
            value={world.rx}
            scale={(value) => Math.round((360 / 100) * value - 180)} // scale from 0-100 to -180-180. value = ((scaled + 180) * 100) / 360
            onChange={(e) => setWorldRx(e.target.value)}
            valueLabelDisplay="auto"
          />
        </div>
        <div>
          <Slider
            value={world.ry}
            scale={(value) => Math.round((360 / 100) * value - 180)} // scale from 0-100 to -180-180. value = ((scaled + 180) * 100) / 360
            onChange={(e) => setWorldRy(e.target.value)}
            valueLabelDisplay="auto"
          />
        </div>

        <div>
          {Object.entries(ik).map(([key, value]) => {
            const angleKeys = [
              "j0",
              "j1",
              "j2",
              "j3",
              "alpha1",
              "alpha2",
              "beta1",
              "gamma1",
              "gamma2",
              "lambda",
            ];
            return (
              <div key={key}>
                {key}:{" "}
                {angleKeys.indexOf(key) > -1
                  ? Math.round(radiansToDegrees(value) * 100) / 100
                  : Math.round(value * 100) / 100}
              </div>
            );
          })}
        </div>
      </div>
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
        <group
          // rotation={[-Math.PI / 2.5, 0, Math.PI / 16]}
          // rotation={[-Math.PI / 2.5, 0, -Math.PI / 8]}
          rotation={[
            degressToRadians(-scaleToDegrees(world.rx)),
            degressToRadians(-scaleToDegrees(world.ry)),
            degressToRadians(-scaleToDegrees(world.rz)),
          ]}
          position={[0, 0, 0]}
        >
          <group scale={1 / 75}>
            <group rotation={[0, 0, ik.j0]}>
              <Joint angle={-ik.j1}>
                <UpperArm length={l1} />
                <Joint position={[l1, 0, 0]} angle={ik.j2}>
                  <UpperArm length={l2} />
                  <Joint position={[l2, 0, 0]} angle={ik.j3}>
                    <PrintHead />
                  </Joint>
                </Joint>
              </Joint>
            </group>

            <mesh>
              <circleGeometry args={[l1 + l2, 50]} />
              <meshBasicMaterial
                color={"dimgray"}
                transparent={true}
                opacity={0.75}
              />
            </mesh>

            <mesh>
              <sphereGeometry args={[l1 + l2, 50, 50]} />
              <meshBasicMaterial
                color={"white"}
                transparent={true}
                opacity={0.2}
              />
            </mesh>

            <ReferenceLine
              start={[0, 0, 0]}
              end={[ik.target_x, ik.target_y, ik.target_z]}
              color={"gray"}
            />
            <ReferenceLine
              start={[0, 0, 0]}
              end={[ik.target_x, ik.target_y, ik.target_z2]}
              color={"gray"}
            />
          </group>

          <mesh>
            <sphereGeometry args={[0.05, 20, 20]} />
            <meshStandardMaterial color={"white"} />
          </mesh>
          <Axis start={[0, 0, 0]} end={[1, 0, 0]} color={"red"} />
          <Axis start={[0, 0, 0]} end={[0, 1, 0]} color={"green"} />
          <Axis start={[0, 0, 0]} end={[0, 0, 1]} color={"blue"} />
        </group>
      </Canvas>
    </>
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
      <mesh position={[props.length/2, 0, 0]}>
        <boxGeometry args={[props.length, 20, 20]} />
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
      <mesh position={[l3/2, 0, 0]}>
        <boxGeometry args={[l3, 15, 15]} />
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

function ReferenceLine({ start, end, color }) {
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
